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

- A running ComfyUI instance. **As of 2026-09-21, this moved**: the original
  instance (`D:\confyiu`, port 8000) had its Desktop-app instance record and
  its `.venv` deleted by accident. Rather than restore it, a fresh instance
  was created through the Desktop app's own "New Instance" flow — it lives at
  `D:\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI`, **port 8188** (auto-
  assigned; check `C:\Users\<user>\AppData\Roaming\Comfy Desktop\port-locks\`
  if it's changed again). `D:\confyiu` itself is untouched and still holds
  every model/checkpoint — the new instance reads them via
  `D:\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\extra_model_paths.yaml`
  (base_path `D:\confyiu\models`), so they were never re-downloaded. The five
  custom node folders were copied by hand into the new instance's own
  `custom_nodes/` (not shareable via extra_model_paths — ComfyUI loads node
  code from its own folder) and their `requirements.txt` installed into the
  new `.venv` with `UV_SYSTEM_CERTS=1` set first (same corporate-TLS
  workaround as everywhere else in this repo). **`comfy-mcp`'s `COMFYUI_URL`
  in `~/.claude.json` still points at the old port 8000** — updating it needs
  the MCP connection restarted, which didn't happen this session, so this
  session drove the new instance with raw `curl` against `/prompt`,
  `/history/<id>`, `/upload/image`, `/view` directly instead. Update that env
  var (or just keep using curl) before assuming `run_workflow` etc. work
  again.
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

## Status update (2026-09-25): Home/Game/Result no longer feature characters

All six screen backgrounds (Home, Settings, Public, Game, Result, Shop) are
now the **same kind of asset**: a character-free, softly-blurred arena
establishing shot, matching `screen-public.json`'s original style — no boy,
no bull, just scenery, with per-screen mood details (Home: calm empty arena;
Game: drifting confetti, more energetic; Result: golden coins/confetti on
the ground, celebratory). This was a deliberate simplification, not a
regression — it also sidesteps every finding in the next few sections
(character fusion, the bull's numbers being erased, outpainting seams all
existed *because* these three used to feature both characters via img2img).

Everything below through "the low-denoise couple scenes need the padding
regenerated separately" describes that **retired** character-scene
technique. It's kept because the findings (character fusion on static
poses, numbers erased above denoise 0.4, outpainting seams) are real and
would bite again if a *future* screen (or the video work in
`intro-video.json`, which still does feature both characters) goes back to
generating them together. The actual files it referenced
(`screen-*-extend.json`, `reference-couple-*.png`, the couple's numbers
work) have been deleted from this folder now that nothing here uses them —
recreate them from this section's description if that need comes back
rather than expecting the files to still exist.

## Key finding: static poses fuse the two characters, dynamic poses don't (retired technique)

Repeated attempts at a **static, standing-side-by-side** pose for the boy and
bull (plain txt2img and img2img alike) kept fusing them into one hybrid
character (horns on the boy, cow patterning on his body, an extra stray
bull/statue appearing) — happened 4 times running, regardless of prompt
wording ("two separate characters", explicit negative prompting against
fusion). Switching to a **dynamic pose** (running, jumping, mid-gesture) fixed
it immediately, first try, every time. Cause unconfirmed, but treat it as a
hard rule: never generate the boy+bull together in a static standing pose:
always seed from / describe an active pose.

## Key finding: img2img at denoise ≥0.42 erases the bull's numbers (retired technique)

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

## `ImagePadForOutpaint` + `VAEEncodeForInpaint`, one pass (retired technique)

Earlier attempts (kept below for context, but don't repeat them) used a
hand-rolled two-pass approach: pad the character crop with solid-color bands
in Python, generate the character at low denoise, then run a *second*
workflow with a hand-built soft-edge mask PNG to regenerate just the padding.
It worked but always left at least a faint seam.

**Use ComfyUI's own built-in outpainting nodes instead — one pass, no
Python mask script:**

1. `LoadImage` — an **unpadded** character crop (a real `intro.mp4` frame,
   dynamic pose, resized to 768 wide, no color bands added).
2. `ImagePadForOutpaint(image, left, top, right, bottom, feathering=80)` —
   pads to the target canvas (768x1344) and outputs both the padded image
   and a correctly-feathered mask in one step. `feathering` below ~80 still
   leaves a visible ring at the boundary; 80 is the current minimum that
   doesn't.
3. `VAEEncodeForInpaint(pixels, vae, mask, grow_mask_by=6)` → `KSampler`
   at **denoise 1.0** — this is correct, not a bug: the mask (not denoise)
   is what protects the character region regardless of the denoise value.
4. One `CLIPTextEncode` conditions the *entire* masked region (both the top
   and bottom bands) at once — write it as two explicit clauses ("above the
   roofline: ...", "below the floor: ...") or content invented for one end
   bleeds into the other (an early attempt asked only for "terracotta roof
   tiles above" and got upside-down roof tiles at the bottom too). Negative-
   prompt "archway, arch, tunnel, foreground pillar" — otherwise the model
   invents an unrelated foreground structure at the top instead of
   continuing the same wall.

`mathematador-universal.json` is the same (now-retired) technique authored
as a proper UI-format graph (node positions, visible links, an on-canvas
usage note) instead of a raw API-format file — it's saved live at
`D:\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\user\default\workflows\
mathematador.json` so it shows up directly in the ComfyUI Desktop app's own
Workflows sidebar. Left in place (both here and live) in case a future
screen wants a character featured again; not deleted along with the other
retired files since it's a reusable *template* rather than a specific
image's recipe. Its `LoadImage` still points at a filename that no longer
exists in the input folder — re-upload whichever crop you want and repoint
that node before running it again.

`mathematador-iconset.json` is the equivalent visual graph for the icon set
(see the composition-consistency finding right below) — also saved live at
`...\ComfyUI\ComfyUI\user\default\workflows\mathematador-iconset.json`, shows
up in the same Workflows sidebar. Its on-canvas note lists the exact subject
clause used for each of the three current icons; to add a fourth, only the
first clause of the positive prompt needs to change.

## Key finding: the low-denoise couple scenes need the padding regenerated separately (retired technique)

The denoise-0.3 fix above (preserving the bull's numbers) only touches the
character region — the solid sky-blue/sand-tan padding bands from the
seed-image construction come out of that pass almost untouched, reading as
flat, obviously-fake color gaps top and bottom. That's what the outpainting
pass above fixes; it doesn't fix itself; you need both passes in sequence
(character generation, *then* outpaint extension) for a finished image.

## Key finding: strip the background/shadow with `rembg`, not the prompt

The icons need a transparent background for actual UI use (no baked-in
gradient rectangle or shadow) — rather than fight the generation prompt to
produce one directly (unreliable, and this checkpoint doesn't do transparency
at all), generate against the consistent grounded/shadowed composition above,
then run the PNG through `rembg` (`pip install rembg` into the ComfyUI venv)
as a separate post-process:

```python
from rembg import remove
from PIL import Image
out = remove(Image.open("icon.png"))  # -> RGBA, transparent outside the subject
out.save("icon-transparent.png")
```

Two gotchas hit doing this:
- `rembg`'s first run downloads a ~1GB ONNX model
  (`bria-rmbg-2.0.onnx`) from a GitHub release URL — same corporate-TLS-
  interception failure as everywhere else in this repo, and it fails
  *silently* inside `pooch`'s downloader (no Python traceback, just an
  `OPENSSL_Uplink` line and a 0-byte temp file). Don't chase it through
  `rembg`/`pooch` — just `curl -L` the same URL directly to
  `~/.rembg/models/bria-rmbg/bria-rmbg.onnx` (the exact path is in the failed
  download's own log line) and it picks it up fine.
- **Do not `pip install pip-system-certs` into this venv** to try to fix the
  above — it broke Python startup entirely (every invocation, even a bare
  `python -c "print(1)"`, crashed with that same `OPENSSL_Uplink` message and
  exit code 1, no traceback). Its `.pth` auto-patch runs on every interpreter
  start and something about it conflicts with this venv's OpenSSL. Fix if it
  happens again: delete/rename `Lib\site-packages\pip_system_certs.pth` (not
  the package itself, just the `.pth` file) — Python starts fine again
  immediately, no reinstall needed. `UV_SYSTEM_CERTS=1` (the fix used
  everywhere else in this repo) is unaffected and still fine to use for `uv`
  specifically; it's only this particular package that's broken here.

## Key finding: icons need one locked composition template, not three ad-hoc ones

The first icon set (settings/shop/docs) was generated independently, one
prompt at a time, and came out visually inconsistent as a *set* even though
each one looked fine alone: the gear floated with no ground contact, the
coins were shot as a heavy-bokeh macro-photo, the book was grounded and sharp
— three different "cameras". Fix: one shared composition template, with only
the subject clause swapped between icons — "resting on a flat surface...
camera at a slight elevated three-quarter angle, object centered filling
about 60% of frame height, sharp focus on the object, background softly out
of focus... soft contact shadow beneath the object", plus negative-prompting
away from the specific failure modes seen before ("floating with no shadow,
heavy bokeh, blurred foreground, extreme close-up"). `mathematador-
iconset.json` is this template as a visual graph (see below); `icon-*.json`
are the same template's three current subject variants in API format.

## Files

- `icon-settings.json` / `icon-shop.json` / `icon-docs.json` — Home-screen nav
  icon set. Juggernaut XL, native 1024x1024, no image conditioning, using the
  shared composition template above (only the subject clause differs between
  the three files).
- `screen-settings.json` / `screen-public.json` / `screen-shop.json` /
  `screen-home.json` / `screen-game.json` / `screen-result.json` — all six
  screen backgrounds, same recipe: no characters, pure txt2img, 768x1344
  portrait, a soft-defocused-arena-establishing-shot prompt (see the status
  update above) with small per-screen mood tweaks in the last clause before
  "vertical portrait composition". Reliable, no gotchas, no image
  conditioning needed for any of them.
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
