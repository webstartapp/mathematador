# ComfyUI asset-generation recipes

Workflow JSONs (ComfyUI API format) and their reference crops, used to generate
assets locally. Kept here so they can be re-run or tweaked in a future session
instead of re-derived from scratch.

## The actual style reference

The approved visual direction is [issue #27](https://github.com/webstartapp/mathematador/issues/27):
a warm, sunlit Spanish arena at golden hour ("Plaza de Aritmética"), Pixar-quality
3D character design, a young Mathematador boy in a teal-and-gold torero outfit
swinging a cape covered in numbers, colorful math-symbol banners, a cheering crowd.
The existing `mathematador-app/assets/video/intro.mp4` (landscape, 1280x720) already
matches this brief — it was generated externally via Gemini/Veo, a fidelity level
this local ComfyUI setup cannot fully reproduce, but should approximate as closely
as possible: warm gold/teal palette, rounded friendly 3D-render shapes, no
neon/cyberpunk, no flat 2D cel-shading.

`docs/toro_numerico_concept.png` is an unrelated, earlier neon/geometric-wireframe
concept sketch — **not** this reference. Don't seed generations from it.

## Setup this assumes

- A running ComfyUI instance (the user's ComfyUI Desktop app, `D:\confyiu`, port 8000
  in this session — adjust host/port to whatever's current).
- **`JuggernautXL_v9.safetensors`** (`RunDiffusion/Juggernaut-XL-v9` on Hugging Face,
  ~7.1GB) — the current checkpoint for icons/stills. SDXL, native 1024x1024, far
  stronger prompt adherence and render quality than the SD1.5 checkpoints below.
  Slower per generation; that's an accepted tradeoff for quality.
- `cartoonArcadiaSDXLSD1_xenoArcadiaCX.safetensors` — used for `intro-video.json`
  only (AnimateDiff/LCM needs an SD1.5-architecture checkpoint; despite the name,
  verified via its safetensors header to actually be SD1.5, not SDXL).
- For video: `AnimateLCM_sd15_t2v.ckpt` (in `models/animatediff_models/`) +
  `AnimateLCM_sd15_t2v_lora.safetensors` (in `models/loras/`), both from
  `huggingface.co/wangfuyun/AnimateLCM`. Requires the `comfyui-animatediff-evolved`
  custom node pack (already installed).

## Files

- `icon-settings.json` / `icon-shop.json` / `icon-docs.json` — current, correct-style
  icon set. Juggernaut XL, native 1024x1024, 35 steps, cfg 7, dpmpp_2m/karras. Prompt
  vocabulary: "Pixar style 3D render, warm golden hour lighting, glossy toy-like
  material, warm gold with teal enamel accents, rounded friendly shapes... product
  icon render, octane render, studio lighting." No image conditioning needed —
  Juggernaut follows this prompt language faithfully without the character-bias
  drift the SD1.5 checkpoint kept fighting.
- `intro-video.json` — AnimateDiff/LCM portrait video (576x1024, 32 frames, 8fps).
  Seeded from `reference-crop-intro-portrait.png`, a real frame extracted from
  the existing `intro.mp4`, cropped to a vertical strip around the boy and
  edge-padded top/bottom to fill 9:16. **Known issue**: at denoise 0.4 the legs
  render as thin lines (an artifact of the edge-padding technique bleeding into
  the leg region); denoise 0.6 fixes the legs but drifts the whole frame toward
  flatter 2D/anime style. A masked/inpainted fix (repaint only the leg region at
  high denoise, keep the rest at low denoise) is the not-yet-tried better option.

Before running an img2img workflow, upload its reference crop to ComfyUI's input
folder (`POST /upload/image`, or drop it in `<comfyui>/input/`) under the exact
filename its `LoadImage` node references.

## To modify

Edit the `text` field of the `CLIPTextEncode` nodes for prompt changes, `denoise` on
a `KSampler` node to trade identity-fidelity (low) for creative freedom (high), or
swap the `LoadImage`/`RepeatImageBatch` source crop for a different reference image.
Submit via the `comfy-mcp` MCP server's `run_workflow` tool, or
`comfy run --workflow <path> --host <host> --port <port>` directly.
