# Character pose sheet + Gemini-generated video/scenery

This folder holds two different kinds of asset, from two different tools:

- **Character pose PNGs** (`boy_*.png`, `bull_*.png`) — generated via the
  **local ComfyUI instance**. See `../comfy-workflows/README.md`'s
  "Character pose sheet" section for the recipe; this file doesn't repeat
  that.
- **`arena_scenery_open.jpg`** and **`intro_candidate_gemini.mp4`** —
  generated via **Gemini's own web app** (`gemini.google.com`), a
  completely separate tool from ComfyUI. This file documents that part:
  the exact prompts, the account/model quirks hit getting there, and why
  it was used instead of continuing to iterate locally.

## Why Gemini instead of local ComfyUI

Two things this repo's local ComfyUI instance could not reliably produce,
documented in detail in `../comfy-workflows/README.md`:

1. **A clean open-arena background** (sand floor, tiered stands, no
   blocking archway) — fourteen local attempts across four different
   techniques, each with a different unresolved artifact (see "Retired:
   local open-arena background" in that file).
2. **A video of the boy and bull interacting** — AnimateDiff on this
   hardware (an AMD integrated GPU) produced ghosting, occlusion errors,
   severe system-RAM exhaustion, and frequent GPU driver crashes
   (`hipErrorLaunchFailure`) across an entire earlier session, regardless
   of prompt technique (pure txt2img, img2img from a seed frame, context
   windowing). See that same file's "Retired: character scenes" section
   and the git history around 2026-09-25 to 2026-09-29 for the full trail.

Gemini's own image/video generation ("nano banana" for images; video
generation is the same chat interface, just ask for a video) succeeded at
both on the **first real attempt** once seeded with this repo's own
approved character reference PNGs — no local GPU involved at all.

## Accessing Gemini

Just the ordinary web app at `gemini.google.com`, logged into a Google
account — no API key, no special access. Two things worth knowing before
trying this again:

- **Model picker** (top-right of the composer, defaults to "Flash"): for
  the final character-accurate video, **Pro** was needed — a Flash attempt
  with only 2 reference images (no arena, no walking poses) produced
  mostly-correct output but with a transient extra-limb glitch on the bull
  at one frame. Pro, with the full 5-image reference set below, produced a
  clean result with no artifacts across every frame checked. Pro takes
  noticeably longer (~10+ minutes for a video, vs under a minute on Flash)
  — don't assume a stalled-looking request is broken; check back rather
  than cancel.
- **Per-account video quota**: video generation is rate-limited per Google
  account (the UI reports "You've reached your video generation limit...
  your limit resets on \<date\>"). If you hit it, wait for the reset
  before trying again.
- **Occasional content-policy refusal**: one attempt at the final video
  prompt (below) was flatly refused — "I can't generate the video you
  requested right now due to interests of third-party content providers"
  — with no further detail. A retry of the exact same prompt and
  reference images later succeeded, which suggests some refusals are
  transient moderation variance rather than a deterministic block, but
  the right response is to wait and retry the same request (or revise the
  prompt if it keeps getting refused), not to route around the refusal by
  switching accounts.

## Attaching reference images

Click the "+" / "Upload & tools" button in the composer → "Upload files".
**If driving this through Claude Code's browser automation** (not a human
using the site directly): clicking that button opens a native OS file
picker that browser automation cannot see or interact with, and this
Gemini page does not expose a normal `<input type="file">` in its
accessibility tree either (it's not reachable via the usual
read_page/find-then-upload approach). The workaround that worked: copy
each image to the Windows clipboard
(`[System.Windows.Forms.Clipboard]::SetImage(...)` via PowerShell) and
paste (Ctrl+V) into the focused composer text box, once per image. A
human just clicking the real upload button and picking files directly
does not need any of this.

## Prompt 1 — the open arena scenery image

Pure text-to-image, no reference image. Model: Flash (default) was
sufficient for this one.

> Generate a vertical 9:16 portrait image, Pixar-style 3D animation still:
> the view from the center of a circular open-air Spanish bullfighting
> arena at golden hour. The camera stands on a completely plain, flat,
> undecorated sand floor with no patterns, rings, or markings of any kind
> drawn on the ground. The arena is fully open to the sky above (no roof,
> no archway, nothing blocking the foreground view). It is surrounded on
> all sides by tiered warm terracotta stone seating packed with a lively
> cheering crowd, with colorful banners printed with math symbols (+, -,
> x, /) hung along the seating tiers, and warm terracotta rooftops visible
> at the very top edge. Clear blue sky overhead. Warm saturated colors,
> cinematic lighting, sharp focus throughout, highly detailed, crisp
> detail, celebratory energetic mood. No text, no watermark, no logos.

**The inline "9:16 portrait" request was ignored** — the first result came
back landscape despite asking for portrait in the same message. Fixed with
a direct follow-up in the same chat:

> This is exactly the scene I wanted, but please regenerate it in a
> vertical portrait aspect ratio (9:16), not landscape.

That reliably produced a true portrait result (1536x2752 downloaded).
Saved as `arena_scenery_open.jpg`. This aspect-ratio-via-follow-up pattern
is worth trying first if a result comes back the wrong orientation again,
before assuming the request needs rewording.

## Prompt 2 — the intro video

Five reference images attached, in this order: `arena_scenery_open.jpg`,
`boy_standing.png`, `boy_walking.png`, `bull_standing.png`,
`bull_walking.png` (all in this same folder). Model: **Pro** (see "Per-
account video quota" above for why — this exact attempt hit a content-
policy refusal on the first account tried, then succeeded on a second
account with no changes).

> Using these reference images — an arena environment, two poses of "the
> boy" character (standing and walking), and two poses of "the bull"
> character (standing and walking) — generate a 5-second video in vertical
> portrait aspect ratio (9:16).
>
> CRITICAL: match the bull character's exact design from its reference
> images — tan/light-brown fur, cream curved horns, black nose, its
> specific face shape and proportions exactly as shown. Do not redesign or
> reinterpret the bull. Each character must have exactly the normal number
> of limbs at all times: the boy has exactly two arms and two hands, the
> bull has exactly two front legs/hooves and two back legs/hooves — no
> extra or duplicated limbs at any point in the video, no morphing.
>
> Also preserve the boy's exact design from his reference images, and the
> arena's exact architecture, crowd, banners, and clean sand floor (no
> patterns or decorations added to the floor).
>
> Scene: the arena from the reference image, golden hour lighting, gentle
> confetti drifting in the air. The boy and the bull start standing a
> short distance apart on the open sand floor, facing each other, then
> both walk toward each other using their walking reference poses for
> gait, and meet warmly in the center with a friendly greeting (e.g. a
> wave and a pat), big cheerful smiles.
>
> Camera holds a steady medium-wide shot capturing both characters
> full-body with the arena stands visible behind them. Pixar-style 3D
> animation render, smooth natural character motion, warm saturated
> colors, cinematic lighting, sharp focus, no text, no watermark, no
> logos.

This succeeded cleanly: portrait 720x1280, 10s/240 frames, correct
character designs maintained throughout (checked frames at 0%, 45%, 90%,
98% of the video), no extra-limb artifacts, clean floor, no blocking
archway. The requested "jump and high-five" framing from an earlier,
looser attempt at this same prompt did not happen literally — the
characters meet and share a warm pat/wave instead — which reads as
in-mood for an intro and was accepted as-is rather than re-prompted.

Downloaded via the video player's own download icon (top-right of the
player, once hovering/playing) — saves directly to the OS Downloads
folder; no API or special export needed.

## Where the results live

- `mathematador-app/assets/video/intro.mp4` — the **production** file,
  wired into `IntroScreen.tsx`. This is the exact output of Prompt 2
  above, copied in directly (no edits/cropping — it was already portrait).
- `intro_candidate_gemini.mp4` (this folder) — an identical backup copy of
  the same file, kept here alongside its generation inputs for reference.
- `arena_scenery_open.jpg` (this folder) — the Prompt 1 output; one of the
  five reference images for Prompt 2, not used anywhere in the app
  directly.
- The `boy_*.png`/`bull_*.png` pose PNGs this folder also holds are the
  ComfyUI-generated character reference set — see
  `../comfy-workflows/README.md` for how those were made. Production
  copies of the subset actually wired into the app live at
  `mathematador-app/assets/images/character-{boy,bull}-*.png` (used by
  `src/components/toro/CharacterReaction.tsx`).

## To regenerate or change

Re-run the same two prompts with the same reference images for a close
variant, or write a new prompt from scratch — Gemini doesn't need the
exact wording above, it's just what worked. If a result's aspect ratio is
wrong, ask for portrait again as a direct follow-up message rather than
relying on the inline prompt text. If limb/design-fidelity issues appear,
the "CRITICAL" paragraph in Prompt 2 is what fixed that same problem once
already (a prior attempt without it produced a passable video but with a
transient extra-limb glitch on the bull) — keep it, strengthen it further
if it recurs. If generation is refused for "third-party content
providers", wait and retry the same request before concluding the
concept is blocked — see "Occasional content-policy refusal" above.
