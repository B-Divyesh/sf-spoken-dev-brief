# Spoken Dev Brief repair handoff

## Status

Release-blocking findings from independent verifier commit `00edaff22a38b039c73f00e823fe4a2a433327e2` are repaired on `main`. The repaired static site is deployed at <https://spoken-dev-brief.sociobot.in>. Desktop release `v0.1.4` is built from commit `23d16ec26f0780ceb82e8f89d44e0b77b235f11f`.

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

The final [v0.1.4 release](https://github.com/B-Divyesh/sf-spoken-dev-brief/releases/tag/v0.1.4) completed successfully in [Actions run 33598686924](https://github.com/B-Divyesh/sf-spoken-dev-brief/actions/runs/33598686924). It contains macOS arm64/x64 DMGs, Windows EXE/MSI installers, Linux AppImage/DEB/RPM packages, app archives, `SHA256SUMS`, and `latest.json`. The manifest lists every supported platform. A fresh download of the 70,692,370-byte Windows EXE passed its published SHA-256 check; evidence is in `/tmp/spoken-v014-release.ELxERN`.

A local Linux packaging preflight produced DEB, RPM, and AppImage bundles. The extracted DEB contains the application, desktop entry, icons, and 77,704,715-byte Whisper model. Its model SHA-256 matches the source (`921e4cf8686fdd993dcd081a5da5b6c365bfde1162e72b08d75ac75289920b1f`). An extracted-package launch under Xvfb stayed running for the 12-second smoke window with no application error output. A live landing-page consumer check resolved Linux to the real v0.1.4 AppImage URL.

Browser coverage includes desktop and 390 px mobile, a 320 px overflow check, 200% text, keyboard-only confirmation/export, touch targets, all routes through Axe, offline reload and cache replacement, malformed storage, Back/Forward focus, canonical changes, a real 404, privacy request capture, and checkout unavailability. All six tested live routes have zero serious or critical Axe violations.

`/opt/fleet/lib/verify-url.sh https://spoken-dev-brief.sociobot.in` passed with HTTP 200, title, `lang=en`, one `<h1>`, `<main>`, image alt text, labeled buttons, and no console errors. Evidence directory: `/tmp/spoken-v014-live.0EDsRX`.

Live deployment identity:

- `index.html` SHA-256: `472b9fd0da4f7e3374c6043836688a9df65c56a94716fe946c157fe5d387fd62`
- `assets/index-BdHvoTdX.js` SHA-256: `2a98077edadb3691ef579e4b147dd0cba8a0c186d56f212e87629df4d1080186`
- `assets/index-By8IkWWK.css` SHA-256: `faf166e48dc4d9fafe4c6e66d6fc854fc4b52c72ae6020881ea02849f0ac3ddb`
- `/qa-missing`: HTTP 404
- hashed JS cache policy: `public, max-age=31536000, immutable`

Final live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.911 s, LCP 1.752 s, TBT 25 ms, CLS 0. Evidence: `/tmp/spoken-v014-lighthouse.json`.

## Demo and privacy

Open <https://spoken-dev-brief.sociobot.in/demo>. The sample data uses only the `demo:` storage namespace. Reset demo clears and reseeds that namespace; Start for real discards it. The workflow is local-first, has no analytics, and contacts no third party during the tested demo flow. License verification is the only documented product API call and runs only when a saved license exists.

No resources outside `sf-spoken-dev-brief*`, the product repository/release, its public hostname, and the product-scoped public checkout URL were read or changed. Shared Sociobot services, settings, databases, vaults, staging, and other products were not accessed.

## Known gaps and operator action

- Register `spoken-dev-brief` with the Sociobot billing engine, then replace the truthful unavailable presentation with the live checkout action. Until then the exact product-scoped URL remains visible but cannot be followed from the UI.
- Desktop packages are unsigned. To sign future releases, configure `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` plus their workflow passwords. The current release copy identifies unsigned packages.
- Perform a human microphone smoke test on each supported operating system. Automated coverage proves WAV decoding and Whisper transcription but cannot prove physical microphone permissions in this worker.
