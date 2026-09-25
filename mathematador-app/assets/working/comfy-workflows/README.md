# ComfyUI asset-generation recipes

This folder holds the ComfyUI workflows (and their reference crops) used to
generate `mathematador-app/assets/images/home-icon-*.png` and
`screen-bg-*.png`. It exists so a human or an agent can regenerate or tweak
any of those images later without re-deriving the setup from scratch.

## Quick start

1. **Check the ComfyUI instance is up**: `curl http://127.0.0.1:8188/system_stats`
   (see "Instance location" below if it's not, or if the port has changed).
2. **Open the right visual workflow** in the ComfyUI Desktop app's Workflows
   sidebar (the folder icon in the left rail) — don't hand-write JSON from
   scratch, these already encode the right checkpoint/settings/composition:
   - **`mathematador-screens`** — the six screen backgrounds (Home, Settings,
     Public, Game, Result, Shop): a character-free, sharp, open-air arena
     shot, 768x1344. Edit only the last clause of the positive prompt (the
     mood), per the on-canvas note.
   - **`mathematador-iconset`** — the three Home-screen nav icons (Settings,
     Shop, Docs): a grounded product-render, 1024x1024. Edit only the first
     clause of the positive prompt (the subject), per the on-canvas note.
     Needs the `rembg` background-removal post-process below before the
     output is usable as an icon.
   - **`mathematador`** — a retired outpainting template for a
     character-featuring scene (the boy + Toro Numérico together). Not used
     by any current asset; kept in case a future screen wants them back. See
     "Retired: character scenes" below before reaching for this.
3. **Edit the prompt, hit Run**, then pull the result from ComfyUI's own
   `output/` folder (or via `GET /view?filename=...&type=output`) and drop it
   into `mathematador-app/assets/images/` under the matching filename.
4. **Icons only**: run the result through `rembg` (see below) before saving —
   the raw generation has an opaque background/shadow baked in.

If a workflow needs to be run headless (an agent doing this without a human
watching the GUI) rather than through the app: POST the workflow's
API-format JSON (the `.json` files in this folder, not the visual graphs
above — see "API-format files" below) to `/prompt`, poll
`/history/<prompt_id>` until non-empty, then `GET /view` the output filename
it reports. `comfy-mcp`'s `run_workflow`/`job` tools do exactly this if its
`COMFYUI_URL` env var is pointed at the current instance; otherwise use raw
`curl` (see "Instance location").

## Instance location

A running ComfyUI instance, currently: `D:\Comfy-Desktop\ComfyUI-Installs\
ComfyUI\ComfyUI`, **port 8188** (auto-assigned — if `curl
http://127.0.0.1:8188/system_stats` doesn't respond, check
`C:\Users\<user>\AppData\Roaming\Comfy Desktop\port-locks\` for the current
port, or open the Comfy Desktop app and launch the "ComfyUI" instance card).

This moved once already (2026-09-21): the original instance (`D:\confyiu`,
port 8000) had its Desktop-app instance record and `.venv` deleted by
accident. Rather than restore it, a fresh instance was created through the
Desktop app's own "New Instance" flow. `D:\confyiu` itself is untouched and
still holds every model/checkpoint — the new instance reads them via
`D:\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\extra_model_paths.yaml`
(`base_path: D:\confyiu\models`), so nothing was re-downloaded. The five
custom node folders were copied by hand into the new instance's own
`custom_nodes/` (not shareable via extra_model_paths — ComfyUI loads node
code from its own folder) and their `requirements.txt` installed into the
new `.venv` with `UV_SYSTEM_CERTS=1` set first (same corporate-TLS
workaround used elsewhere in this repo, e.g. `mathematador-app/CLAUDE.md`).

**`comfy-mcp`'s `COMFYUI_URL` in `~/.claude.json` still points at the old
port 8000** as of this instance move — that env var only takes effect when
the MCP connection (re)starts, so update it and restart Claude Code, or just
drive the instance with raw `curl` against `/prompt`, `/history/<id>`,
`/upload/image`, `/view` (every recipe below was verified this way).

## Models in use

- **`JuggernautXL_v9.safetensors`** (`RunDiffusion/Juggernaut-XL-v9` on
  Hugging Face, ~7.1GB) — the checkpoint for every still image (icons and
  screens both). SDXL, native 1024x1024, far stronger prompt adherence than
  the SD1.5 checkpoints below. Slower per generation; accepted tradeoff for
  quality.
- `cartoonArcadiaSDXLSD1_xenoArcadiaCX.safetensors` — used for
  `intro-video.json` only (AnimateDiff/LCM needs an SD1.5-architecture
  checkpoint; despite the name, verified via its safetensors header to
  actually be SD1.5, not SDXL).
- For video: `AnimateLCM_sd15_t2v.ckpt` (`models/animatediff_models/`) +
  `AnimateLCM_sd15_t2v_lora.safetensors` (`models/loras/`), both from
  `huggingface.co/wangfuyun/AnimateLCM`.
- IPAdapter models (`models/clip_vision/CLIP-ViT-H-14-laion2B.safetensors`,
  `models/ipadapter/ip-adapter-plus_sdxl_vit-h.safetensors`, from
  `h94/IP-Adapter`) are downloaded but **not used by anything current** — the
  `ComfyUI_IPAdapter_plus` custom node they need was never installed (its
  `git clone` step is blocked by the Claude Code auto-mode classifier as
  "Untrusted Code Integration" — a human needs to run it). Only relevant
  again if character-consistent generation (see "Retired: character
  scenes") comes back into scope.

## The actual style reference

The approved visual direction is [issue #27](https://github.com/webstartapp/mathematador/issues/27):
a warm, sunlit Spanish arena at golden hour ("Plaza de Aritmética"),
Pixar-quality 3D character design — a young Mathematador boy in a
teal-and-gold torero outfit, and his companion **Toro Numérico**, a friendly
rounded cream-colored bull with blonde horns and glowing numbers on its
body. Real reference assets already in the repo, all generated externally
(Gemini/Veo) at a fidelity this local setup can only approximate:

- `mathematador-app/assets/video/intro.mp4` — landscape, 1280x720, 10s/240
  frames. Was the source of character-pose reference crops when the retired
  character-scene technique was in use (`ffprobe`/`cv2` to pull frames at a
  given index).
- `mathematador-app/assets/images/intro-screen.png`, `splash.png`,
  `adaptive-icon.png`, `icon.png` — all already correct, already wired in
  `app.json`. Don't regenerate these without a real reason.

`docs/toro_numerico_concept.png` is an unrelated, earlier neon/geometric-
wireframe concept sketch — **not** this reference. Don't seed generations
from it.

## Current recipes

**Screen backgrounds** (`screen-*.json`, and the `mathematador-screens`
visual graph) — all six (Home, Settings, Public, Game, Result, Shop): no
characters, pure txt2img, 768x1344 portrait, sharp focus throughout,
explicitly open-air. Reliable, no image conditioning needed. Positive
prompt template (only the last clause before "vertical portrait
composition" changes per screen):

> Pixar style 3D animation still, an open-air Spanish arena establishing
> shot at golden hour, sunlit outdoor plaza under a clear open blue sky, no
> roof or canopy overhead, colorful banners with math symbols hanging from
> stone archways, empty arena floor, no characters, sharp focus throughout,
> crisp detail, **{mood clause}**, vertical portrait composition, warm
> saturated colors, cinematic lighting, highly detailed

Negative prompt (fixed, all six):

> roof, ceiling, canopy overhead, covered stands, indoor, tent, awning
> overhead, blurry, soft focus, out of focus, low contrast, hazy, bokeh,
> neon, cyberpunk, futuristic, wireframe, dark background, flat 2D, cel
> shading, thick black outline, watermark, text overlay, logo, low quality,
> deformed, character, person, boy, bull, animal, face, weapon, violence,
> scary

Without that negative prompt's "roof, ceiling, canopy overhead, covered
stands, indoor, tent", the model drifts back to a covered/indoor-reading
composition even when the positive prompt says "open-air" — keep it.

Current mood clauses: Home "peaceful and inviting mood, ready for a warm
welcome"; Public "peaceful and inviting mood" (sits behind actual readable
text on the `/info/*` pages — if legibility becomes an issue there, dialing
contrast back down for this one screen only is a legitimate fix, not a sign
this recipe is wrong); Game "empty arena floor with confetti scattered and
drifting through the air ... energetic and lively atmosphere"; Result "empty
arena floor with golden coins and confetti scattered on the ground ...
celebratory victorious mood". Settings and Shop use their own distinct
compositions (a backstage prep room; a market stall) rather than this exact
template — see their own `.json` files.

**Icons** (`icon-*.json`, and the `mathematador-iconset` visual graph) —
Home-screen nav icons, 1024x1024, no image conditioning. All three share one
composition template so they read as a matched set (an earlier
independently-generated version didn't — one floated with no shadow, one
was a heavy-bokeh macro-photo, one was grounded and sharp; three different
"cameras"). Positive prompt template (only the first clause changes):

> single mobile game app icon, **{subject}**, resting on a flat surface,
> Pixar style 3D render, warm golden hour lighting from upper left, glossy
> toy-like material, warm gold with teal enamel accents, rounded friendly
> shapes, warm saturated colors, plain warm sandy gradient background, soft
> contact shadow beneath the object, camera at a slight elevated
> three-quarter angle, object centered filling about 60% of frame height,
> sharp focus on the object, background softly out of focus, product icon
> render, octane render, studio lighting

Negative prompt (fixed, all three):

> neon, cyberpunk, futuristic, wireframe, dark background, character,
> mascot, creature, animal, person, face, eyes, body, hands, watermark,
> text, blurry, low quality, flat 2D, cel shading, thick black outline,
> photorealistic metal, rust, floating with no shadow, heavy bokeh, blurred
> foreground, extreme close-up, off-center, cropped

Current subjects: Settings "one mechanical gear cog with thick trapezoidal
teeth"; Shop "a neat stack of three round gold coins, resting flat"; Docs
"one closed leather-bound book standing upright with a gold buckle clasp
and gold page edges". This checkpoint has a strong bias toward drawing a
character/mascot instead of an object when the subject phrase is ambiguous
or resembles clothing/a creature ("cape" alone, "coin" without "stack") —
keep the negative prompt's character/mascot/face terms in place, and if a
generation drifts into a character anyway, make the subject phrase more
explicitly an inanimate object.

**Icon post-process — strip the background/shadow with `rembg`, not the
prompt.** Icons need a transparent background for actual UI use; rather than
fight the generation prompt for it directly (unreliable, and this checkpoint
doesn't produce alpha transparency at all), generate against the grounded/
shadowed composition above, then:

```python
from rembg import remove
from PIL import Image
out = remove(Image.open("icon.png"))  # -> RGBA, transparent outside the subject
out.save("icon-transparent.png")
```

`pip install rembg` into the ComfyUI venv first if it's not there. Two
gotchas hit doing this the first time:
- `rembg`'s first run downloads a ~1GB ONNX model (`bria-rmbg-2.0.onnx`)
  from a GitHub release URL — same corporate-TLS-interception failure as
  everywhere else in this repo, and it fails *silently* inside `pooch`'s
  downloader (no Python traceback, just an `OPENSSL_Uplink` line and a
  0-byte temp file). Don't chase it through `rembg`/`pooch` — just
  `curl -L` the same URL directly to
  `~/.rembg/models/bria-rmbg/bria-rmbg.onnx` (the exact path is in the
  failed download's own log line) and it picks it up fine.
- **Do not `pip install pip-system-certs` into this venv** to try to fix
  the above — it broke Python startup entirely (every invocation, even a
  bare `python -c "print(1)"`, crashed with that same `OPENSSL_Uplink`
  message and exit code 1, no traceback). Its `.pth` auto-patch runs on
  every interpreter start and conflicts with this venv's OpenSSL. Fix if it
  happens again: delete/rename `Lib\site-packages\pip_system_certs.pth`
  (not the package itself, just the `.pth` file) — Python starts fine again
  immediately, no reinstall needed. `UV_SYSTEM_CERTS=1` is unaffected and
  still fine to use for `uv` specifically; it's only this one package
  that's broken here.

## API-format files vs. the visual graphs

Everything in "Current recipes" above exists in two forms in this folder:
- `icon-*.json` / `screen-*.json` — flat ComfyUI **API-format** JSON (node
  id → `{class_type, inputs}`). POST-able straight to `/prompt`; this is
  what an agent should read/edit/submit programmatically. These are NOT
  directly openable in the ComfyUI GUI canvas.
- `mathematador-iconset.json` / `mathematador-screens.json` /
  `mathematador.json` — proper **UI-format** graphs (node positions, visible
  links, an on-canvas usage note), saved live at
  `D:\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\user\default\workflows\`
  so they show up in the Desktop app's own Workflows sidebar for a human to
  open and hand-tweak. These repo copies are backups; the live ones in
  ComfyUI's own user-data folder are what to actually edit.

Keep both in sync by hand if you change one — there's no automatic
conversion between the two formats set up here.

`intro-video.json` — AnimateDiff/LCM portrait video (576x1024, 32 frames,
8fps), API-format only, no visual graph built for it yet. Seeded from
`reference-crop-intro-portrait.png`, edge-STRETCHED (not solid-fill)
padding — **known bug**: at denoise 0.4 the legs render as thin lines
because the stretch bled into the leg region; denoise 0.6 fixes the legs
but drifts the whole frame toward flatter 2D/anime style. Fix this with the
solid-fill padding technique described under "Retired: character scenes"
below (that's still valid technique, just for a different asset) before
generating more video.

Before running an img2img workflow, upload its reference crop to ComfyUI's
input folder (`POST /upload/image`, or drop it in `<comfyui>/input/`) under
the exact filename its `LoadImage` node references.

## Retired: character scenes (Home/Game/Result used to feature the boy + bull)

Home, Game, and Result originally featured the boy and Toro Numérico
together, generated via img2img from real `intro.mp4` frames. They were
simplified to the character-free recipe above by request — this section is
kept only because the findings below are real and would matter again if a
*future* screen (or `intro-video.json`, which still features both
characters) needs them together. The specific files this section used to
reference (`screen-*-extend.json`, `reference-couple-*.png`) have been
deleted now that nothing here uses them; recreate them from these
descriptions if the need comes back.

**Static poses fuse the two characters; dynamic poses don't.** Repeated
attempts at a static, standing-side-by-side pose for the boy and bull (plain
txt2img and img2img alike) kept fusing them into one hybrid character
(horns on the boy, cow patterning on his body, an extra stray bull/statue
appearing) — happened 4 times running, regardless of prompt wording ("two
separate characters", explicit negative prompting against fusion).
Switching to a dynamic pose (running, jumping, mid-gesture) fixed it
immediately, first try, every time. Cause unconfirmed; treat as a hard rule.

**img2img at denoise ≥0.42 erases the bull's numbers.** The bull's glowing
numbers-on-fur texture is present in every real source frame, but img2img at
denoise 0.42-0.6 reliably wipes it out even with the numbers explicitly
described in the prompt — the model treats the source's own number texture
as noise to smooth away during resampling, and doesn't reliably repaint it
from text either. Denoise 0.3 (steps bumped to 40 to compensate) is what
actually preserves it.

**Extending the canvas needs `ImagePadForOutpaint` + `VAEEncodeForInpaint`,
one pass** — not a hand-rolled two-pass mask script (tried first: pad with
solid-color bands in Python, generate the character at low denoise, then a
*second* workflow with a hand-built soft-edge mask PNG to regenerate just
the padding — worked but always left a faint seam). The one-pass version:

1. `LoadImage` — an **unpadded** character crop (a real `intro.mp4` frame,
   dynamic pose, resized to 768 wide, no color bands added).
2. `ImagePadForOutpaint(image, left, top, right, bottom, feathering=80)` —
   pads to the target canvas and outputs both the padded image and a
   correctly-feathered mask in one step. `feathering` below ~80 still
   leaves a visible ring at the boundary.
3. `VAEEncodeForInpaint(pixels, vae, mask, grow_mask_by=6)` → `KSampler` at
   **denoise 1.0** — correct, not a bug: the mask (not denoise) protects the
   character region regardless of the denoise value.
4. One `CLIPTextEncode` conditions the *entire* masked region (both top and
   bottom bands) at once — write it as two explicit clauses ("above the
   roofline: ...", "below the floor: ...") or content invented for one end
   bleeds into the other. Negative-prompt "archway, arch, tunnel, foreground
   pillar" — otherwise the model invents an unrelated foreground structure
   at the top instead of continuing the same wall.

`mathematador.json` (`mathematador-universal.json` in this repo folder) is
this outpainting technique as a visual graph — still live in ComfyUI's
Workflows sidebar. Its `LoadImage` points at a filename that no longer
exists in the input folder; re-upload whichever crop you want and repoint
that node before running it again.

## To modify

Edit the `text` field of a `CLIPTextEncode` node for prompt changes,
`denoise` on a `KSampler` node to trade identity-fidelity (low) for
creative freedom (high), or swap a `LoadImage` source crop for a different
reference image. Submit via the `comfy-mcp` MCP server's `run_workflow`
tool (if its `COMFYUI_URL` is current), or raw `curl`/`comfy run --workflow
<path> --host <host> --port <port>` otherwise.
