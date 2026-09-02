# Spoken Dev Brief visual system

## Direction

Art-deco transit poster. A spoken decision moves from a fleeting voice line to a durable, routed engineering record. The interface borrows the strong rails, stepped corners, timetable labels, and disciplined geometry of 1930s rail posters without using nostalgia as copy. It should look like a focused desktop instrument, not a generic SaaS dashboard.

## Palette

- `--ink: #172522` — near-black green for text and night surfaces.
- `--paper: #f4eddd` — warm ticket-stock background.
- `--paper-2: #e8ddc6` — recessed fields and secondary surfaces.
- `--signal: #b52b32` — recording and primary action; dark enough with white text.
- `--signal-dark: #7d1c24` — pressed state and links on paper.
- `--brass: #b27a28` — rules, selected paths, and focus accents.
- `--teal: #1d5b58` — confirmed state and secondary action.
- `--muted: #58635e` — supporting text (7:1 on paper).
- `--danger: #9b2226`; `--success: #17634f`; `--warning: #7a4c00`.

The app is explicitly warm-light in the work area and ink-dark in the navigation. This single-mode treatment matches a printed brief on a station board and avoids a decorative theme switch in a task app.

## Type

- Display: `Avenir Next`, `Futura`, `Century Gothic`, sans-serif. Wide tracking and geometric capitals recall destination boards.
- Body: `Iowan Old Style`, `Palatino Linotype`, `Book Antiqua`, serif. It makes the approved brief read like a durable document.
- Controls and metadata use the display stack. Body copy and transcript text use the serif stack. Both are installed-system stacks, so no font or CDN request is made.

## Spacing and shape

Use an 8 px base rhythm: 4, 8, 12, 16, 24, 32, 48, 64, 96. Page measures stop at 1184 px; reading text stops near 68 characters. Panels use clipped/stepped corners rather than generic rounded cards. Parallel 2 px rules mark stages. Controls are at least 44 px high.

## Interaction grammar

The workflow is a route: Capture → Draft → Confirm → Export. A current-stage marker travels along a horizontal rail. Recording adds one restrained pulse to the consent lamp. Adding a repository reference draws a short line into the decision. Nothing moves without conveying state.

## Motion

Transitions last 180–240 ms and change opacity or transform only. The route marker slides between stages; new brief rows rise 8 px from their source. The record indicator pulses once per second only while actively recording. Under `prefers-reduced-motion: reduce`, all movement stops and state changes use color plus text.

## Asset plan and provenance

The hero uses one original generated poster illustration: a brass microphone whose waveform becomes transit rails, ending at a paper engineering brief with small code-path glyphs. No text appears in the image. It is used as a responsive WebP and as the source for a hand-composed 1200 × 630 social card.

Prompt sheet: stylized-concept; art-deco transit poster; brass desk microphone and geometric sound wave becoming parallel rail lines that lead to a cream engineering decision sheet with abstract code-path marks; flat screen-printed gouache; stepped geometry; warm paper grain; ink green, oxblood red, cream and restrained brass; dramatic diagonal composition; crisp silhouette; generous negative space; no people, no letters, no readable text, no logos, no watermark, no gradients, no photorealism.

Generated with the factory image model (`factory-image`) on 2026-09-02. Original asset for this product; prompt sidecar is stored beside the source. UI icons and wordmark are hand-authored SVG/CSS geometry.
