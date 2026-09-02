# Spoken Dev Brief repair handoff

## Status

Release-blocking findings from independent verifier commit `00edaff22a38b039c73f00e823fe4a2a433327e2` are repaired on `main`. The repaired static site is deployed at <https://spoken-dev-brief.sociobot.in>. Desktop release `v0.1.4` contains the final repair.

## Repairs

- Markdown and Jira exports remain disabled until the user checks the confirmation control. Core export functions also reject draft briefs. Editing a confirmed brief returns it to draft.
- Transcript parsing now extracts named owners and repository paths, including line suffixes. The verifier transcript produces owner `Maya` and references `src/lib/sync.ts:48` and `src/config/limits.ts`.
- `.factory/claims.json` now covers the demo, local drafting, both confirmed exports, device privacy, offline reload, consent, retention, truthful purchase availability, license verification, native transcription, covert recording, people scoring, code writing, model training, and analytics. Each claim has exactly one matching tagged regression.
- Native Tauri transcription now decodes WAV audio and runs the bundled Whisper model. The fixture test transcribes real speech using the checksum-pinned model.
- Malformed or incompatible brief, settings, and license JSON is removed safely. The app keeps one `<h1>` and shows an actionable recovery notice.
- Visible navigation, footer, legal, consent, and demo controls meet the 44 px target. The workspace fits 320 px and 390 px, including 200% text resizing.
- History Back and Forward synchronously focus the route `<h1>` and update the polite route announcement.
- Each route has its own title, description, canonical, and Open Graph URL. Unknown routes use a styled document with a real HTTP 404.
- Content-hashed assets use `public, max-age=31536000, immutable`; the service worker replaces its prior cache and remains offline-capable.
- Rust sources pass `cargo fmt --check` and strict Clippy.
- The product-scoped Sociobot checkout URL is preserved in the page. Because registration is operator-gated, it is presented as unavailable, is `aria-disabled`, makes no checkout request, and states why. No shared platform resource or backend was accessed.
- Release `v0.1.4` includes the final text-resize repair in both the static site and desktop shell.

## Verification evidence

Clean and aggregate checks:

```sh
npm ci                         # 65 packages; 0 vulnerabilities
npm audit                      # 0 vulnerabilities
npm run lint                   # TypeScript and cargo fmt pass
npm test                       # 7 Vitest + 31 Chromium tests pass
npm run build                  # dist/site produced
npm run build:app              # dist/app produced
npm run test:native            # real WAV + Whisper transcription passes
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml  # 2 pass
CI=true npm run tauri build    # Linux desktop packages produced
```

Production site output is 33.77 KB JS (11.67 KB gzip), 2.48 KB lazy JS (1.01 KB gzip), and 18.02 KB CSS (4.75 KB gzip). This is below the product budgets.

The local package check produced a 74,084,168-byte `.deb`, 74,086,812-byte `.rpm`, and 148,785,656-byte AppImage. The extracted `.deb` contains the application, desktop entry, icons, and 77,704,715-byte Whisper model. Its model SHA-256 matches the source (`921e4cf8686fdd993dcd081a5da5b6c365bfde1162e72b08d75ac75289920b1f`). An extracted-package launch under Xvfb stayed running for the 12-second smoke window with no application error output.

Browser coverage includes desktop and 390 px mobile, a 320 px overflow check, 200% text, keyboard-only confirmation/export, touch targets, all routes through Axe, offline reload and cache replacement, malformed storage, Back/Forward focus, canonical changes, a real 404, privacy request capture, and checkout unavailability. All six tested live routes have zero serious or critical Axe violations.

`/opt/fleet/lib/verify-url.sh https://spoken-dev-brief.sociobot.in` passed with HTTP 200, title, `lang=en`, one `<h1>`, `<main>`, image alt text, labeled buttons, and no console errors. Evidence directory: `/tmp/spoken-v013-live.UQF0NJ`.

Live deployment identity:

- `index.html` SHA-256: `e7815dd54033232697d65bf331873cd8827e6a046ddaf4cb3cc51ebeb0775a73`
- `assets/index-DyFD_ZJF.js` SHA-256: `f9fe78302abb287b4cb0f01e2fc7f6a96d8d962e9c243ab2998e7ec4fad940c3`
- `/qa-missing`: HTTP 404
- hashed JS cache policy: `public, max-age=31536000, immutable`

Lighthouse mobile from the final repair line: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.279 s, LCP 2.119 s, TBT 21 ms, CLS 0.

## Demo and privacy

Open <https://spoken-dev-brief.sociobot.in/demo>. The sample data uses only the `demo:` storage namespace. Reset demo clears and reseeds that namespace; Start for real discards it. The workflow is local-first, has no analytics, and contacts no third party during the tested demo flow. License verification is the only documented product API call and runs only when a saved license exists.

No resources outside `sf-spoken-dev-brief*`, the product repository/release, its public hostname, and the product-scoped public checkout URL were read or changed. Shared Sociobot services, settings, databases, vaults, staging, and other products were not accessed.

## Known gaps and operator action

- Register `spoken-dev-brief` with the Sociobot billing engine, then replace the truthful unavailable presentation with the live checkout action. Until then the exact product-scoped URL remains visible but cannot be followed from the UI.
- Desktop packages are unsigned. To sign future releases, configure `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` plus their workflow passwords. The current release copy identifies unsigned packages.
- Perform a human microphone smoke test on each supported operating system. Automated coverage proves WAV decoding and Whisper transcription but cannot prove physical microphone permissions in this worker.
