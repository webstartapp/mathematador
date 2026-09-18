# ComfyUI asset-generation recipes

Workflow JSONs (ComfyUI API format) and their reference crops, used to generate
assets locally. Kept here so they can be re-run or tweaked in a future session
instead of re-derived from scratch.

## The actual style reference

The approved visual direction is [issue #27](https://github.com/webstartapp/mathematador/issues/27):
a warm, sunlit Spanish arena at golden hour ("Plaza de Aritmética"), Pixar-quality
3D character design — a young Mathematador boy in a teal-and-gold torero outfit,
and his companion **Toro Numérico**, a friendly rounded cream-colored bull with
blonde horns and glowing numbers on its body. They're a couple/duo and should
usually appear together. Real reference assets already in the repo, all
generated externally (Gemini/Veo) at a fidelity this local setup can only
approximate:

- `mathematador-app/assets/video/intro.mp4` — landscape, 1280x720, 10s/240 frames.
  Source of most character-pose reference crops below (`ffprobe`/`cv2` to pull
  frames at a given index).
- `mathematador-app/assets/images/intro-screen.png`, `splash.png`,
  `adaptive-icon.png`, `icon.png` — all already correct, already wired in
  `app.json`. Don't regenerate these without a real reason.

`docs/toro_numerico_concept.png` is an unrelated, earlier neon/geometric-wireframe
concept sketch — **not** this reference. Don't seed generations from it.

## Setup this assumes

- A running ComfyUI instance (the user's ComfyUI Desktop app, `D:\confyiu`, port 8000
  in this session — adjust host/port to whatever's current).
- **`JuggernautXL_v9.safetensors`** (`RunDiffusion/Juggernaut-XL-v9` on Hugging Face,
  ~7.1GB) — the current checkpoint for stills. SDXL, native 1024x1024, far
  stronger prompt adherence than the SD1.5 checkpoints below. Slower per
  generation; accepted tradeoff for quality.
- `cartoonArcadiaSDXLSD1_xenoArcadiaCX.safetensors` — used for `intro-video.json`
  only (AnimateDiff/LCM needs an SD1.5-architecture checkpoint; despite the name,
  verified via its safetensors header to actually be SD1.5, not SDXL).
- For video: `AnimateLCM_sd15_t2v.ckpt` (in `models/animatediff_models/`) +
  `AnimateLCM_sd15_t2v_lora.safetensors` (in `models/loras/`), both from
  `huggingface.co/wangfuyun/AnimateLCM`.
- IPAdapter (for character-consistent generation, better than the img2img crop
  technique below): `ComfyUI_IPAdapter_plus` custom node
  (`github.com/cubiq/ComfyUI_IPAdapter_plus`, blocked from auto-install by the
  Claude Code classifier — clone it into `custom_nodes/` by hand and restart
  ComfyUI), `models/clip_vision/CLIP-ViT-H-14-laion2B.safetensors` and
  `models/ipadapter/ip-adapter-plus_sdxl_vit-h.safetensors` (both downloaded,
  from `h94/IP-Adapter` on Hugging Face). Not yet used by any workflow here —
  all couple scenes below use plain img2img instead.

## Key finding: static poses fuse the two characters, dynamic poses don't

Repeated attempts at a **static, standing-side-by-side** pose for the boy and
bull (plain txt2img and img2img alike) kept fusing them into one hybrid
character (horns on the boy, cow patterning on his body, an extra stray
bull/statue appearing) — happened 4 times running, regardless of prompt
wording ("two separate characters", explicit negative prompting against
fusion). Switching to a **dynamic pose** (running, jumping, mid-gesture) fixed
it immediately, first try, every time. Cause unconfirmed, but treat it as a
hard rule: never generate the boy+bull together in a static standing pose:
always seed from / describe an active pose.

## Key finding: img2img at denoise ≥0.42 erases the bull's numbers

The bull's glowing numbers-on-fur texture is present in every real source
frame, but img2img at denoise 0.42-0.6 reliably wipes it out even with the
numbers explicitly described in the prompt (positive: "dozens of glowing
soft white numbers and math symbols floating on and embedded in its fur...";
negative: "two-tone fur, white belly patch, wearing clothes, vest, pants,
plain fur, no markings") — the model treats the source's own number texture
as noise to smooth away during resampling, and doesn't reliably repaint it
from text either. **Denoise 0.3 (with steps bumped to 40 to compensate) is
what actually preserves it.** All three couple-scene workflows now use this;
apply it to any future one seeding from a frame where the bull's numbers
need to stay legible.

## The visual, tweakable graph — `mathematador-universal.json`

Everything above was submitted straight to ComfyUI's `/prompt` API
(`comfy-mcp`'s `run_workflow`), which runs a workflow but never loads it into
the ComfyUI GUI's canvas — nothing was ever visible/tweakable in the app
window. `mathematador-universal.json` fixes that: it's a proper UI-format
graph (node positions, visible links, an on-canvas usage note), saved at
`D:\confyiu\user\default\workflows\mathematador.json` so it shows up directly
in the ComfyUI Desktop app's own Workflows sidebar — open it there to inspect
or hand-tweak any node. This copy in the repo is a backup; the live one to
edit is the one in ComfyUI's own user-data folder.

It also uses a cleaner technique than the two-pass hack below: ComfyUI's
built-in `ImagePadForOutpaint` + `VAEEncodeForInpaint` nodes do the
pad+feather+mask in one built-for-purpose step, instead of a hand-rolled
Python mask script and a separate second workflow. Feed it any unpadded
character crop (`reference-couple-gesture-unpadded.png` is the one currently
loaded) and it extends it to a full portrait background in a single
KSampler pass, with the character region fully protected regardless of the
(intentionally 1.0) denoise value — read the note node on the canvas itself
for the exact how-to. **Prefer this graph over the `screen-*.json` /
`screen-*-extend.json` two-pass approach below for anything new**; that
section is kept only as a record of what didn't work as well.

## Key finding: the low-denoise couple scenes need a second masked pass (superseded, see above)

The denoise-0.3 fix above (preserving the bull's numbers) leaves the solid
sky-blue/sand-tan padding bands from the seed-image construction almost
untouched too — they read as flat, obviously-fake color gaps top and bottom.
Fix: a **second pass**, `screen-*-extend.json`, that masks OUT the already-
correct character band (protect, denoise ~0) and masks IN just the top/bottom
padding (regenerate at denoise 0.95) via `SetLatentNoiseMask` + a hand-built
soft-edge mask PNG (`mask-*.png` — white=regenerate, black=protect, black,
~150-180px gaussian-style feather at the boundary; a hard-edge mask produces
a visible seam even at full protect/regenerate contrast). Two more gotchas
found fixing this:
- The single `CLIPTextEncode` conditions the WHOLE masked region (both top
  and bottom bands) at once — describing only the top ("terracotta roof
  tiles above") bled into the bottom too and produced upside-down roof tiles
  where a sandy floor should be. Write the prompt as two explicit clauses,
  one for "above the roofline" content, one for "below the floor" content.
  A generic archway/architecture description can also get invented for the
  top if the prompt doesn't explicitly ask for a *continuation of the same*
  wall — negative-prompt "archway, arch, tunnel, foreground pillar" to
  suppress that.
- Feather narrower than ~150px still leaves a faint but visible ring at the
  boundary. Widen it rather than trying to hide it with a fully-opaque
  boundary.

## Files

- `icon-settings.json` / `icon-shop.json` / `icon-docs.json` — Home-screen nav
  icon set. Juggernaut XL, native 1024x1024, no image conditioning (this
  checkpoint follows "Pixar style 3D render, warm golden hour lighting, glossy
  toy-like material, warm gold with teal enamel accents... product icon
  render, octane render, studio lighting" faithfully on its own).
- `screen-settings.json` / `screen-public.json` / `screen-shop.json` — no
  characters, pure txt2img, 768x1344 portrait, same prompt vocabulary as the
  icons. Reliable, no gotchas.
- `screen-home.json` / `screen-game.json` / `screen-result.json` — pass 1:
  both characters together, in the correct portrait dimensions React Native
  actually needs (768x1344, not the intro.mp4's cropped landscape). img2img,
  denoise 0.3 (see the numbers-preservation finding below), seeded from a
  **dynamic-pose** crop of a real `intro.mp4` frame (`reference-couple-
  gesture.png`, `-running.png`, `-jumping.png`) that's been resized to 768
  wide and padded top/bottom with solid sky-blue / sand-tan fill (not
  stretched — that caused a separate leg-artifact bug, see `intro-video.json`'s
  note below) to reach 1344 tall. `reference-boy-alone.png` /
  `reference-bull-alone.png` are separate single-character crops, prepared for
  IPAdapter but not yet used.
- `screen-home-extend.json` / `screen-game-extend.json` /
  `screen-result-extend.json` — pass 2, run on pass 1's own output (re-upload
  it to ComfyUI's input folder first) with `mask-home.png` / `mask-game.png` /
  `mask-result.png`: replaces the flat padding bands with real extended scenery
  while leaving the character band untouched. See the masked-pass finding
  above before reusing this on a new image — the mask boundaries
  (`pad_top`/`pad_bottom` baked into each PNG) are specific to that image's
  own crop, not reusable as-is for a different composition.
- `intro-video.json` — AnimateDiff/LCM portrait video (576x1024, 32 frames,
  8fps). Seeded from `reference-crop-intro-portrait.png`, edge-STRETCHED
  (not solid-fill) padding — **known bug**: at denoise 0.4 the legs render as
  thin lines because the stretch bled into the leg region; denoise 0.6 fixes
  the legs but drifts the whole frame toward flatter 2D/anime style. Redo this
  one with the solid-fill padding technique from the screen-* files above
  instead of the stretch technique, before generating more video.

Before running an img2img workflow, upload its reference crop to ComfyUI's input
folder (`POST /upload/image`, or drop it in `<comfyui>/input/`) under the exact
filename its `LoadImage` node references.

## To modify

Edit the `text` field of the `CLIPTextEncode` nodes for prompt changes, `denoise` on
a `KSampler` node to trade identity-fidelity (low) for creative freedom (high), or
swap the `LoadImage` source crop for a different reference image (always a
dynamic pose for two-character scenes — see above). Submit via the `comfy-mcp`
MCP server's `run_workflow` tool, or `comfy run --workflow <path> --host <host>
--port <port>` directly.
