# Spoken Dev Brief handoff

## What was built

- Tauri 2 desktop app with explicit consent, microphone-to-WAV capture, packaged Whisper `tiny.en` transcription, and no audio upload.
- Local brief drafting that separates decisions, assumptions, and open questions.
- Human review, named ownership, repository references, confirmation, Markdown download, and Jira-formatted clipboard export.
- Local retention settings, immediate deletion, and a manual transcript fallback.
- Isolated `/demo` with realistic sample data, reset/exit controls, its own storage namespace, and offline reload.
- Art-deco transit-poster design, original generated hero art, three real UI walkthrough frames, responsive 390 px layout, and reduced-motion behavior.
- `/privacy`, `/terms`, in-app 404, metadata, social card, sitemap, robots, service worker, CSP, and security headers.
- $12/user/month Pro offer with hosted Sociobot checkout, license capture, daily verification cache, and paste-to-restore.
- GitHub Actions release matrix for macOS arm64/x64, Windows x64, Linux AppImage/deb, checksums, and `latest.json`.

## Run and verify

```sh
npm install
npm test
npm run build
npm run build:app
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml --lib
```

The static deploy root is `dist/site/`; its `index.html` is present at that root. The Tauri UI is `dist/app/`.

Verification on 2026-09-02:

- `npm test`: 2 Vitest tests and 15 Playwright tests passed.
- Every command in `.factory/claims.json` is covered by its tagged test.
- Playwright axe: no serious or critical issues on `/`, `/demo`, `/privacy`, or `/terms`.
- Chromium console: no page-load errors.
- `cargo check`: passed after installing the Linux Tauri prerequisites.
- `cargo test --lib`: 1 native audio-pipeline test passed.
- `npm audit --omit=dev`: 0 vulnerabilities.
- Production site bundle: 10.36 KB initial JS gzip and 4.43 KB CSS gzip. Largest hero is 159 KB WebP.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100. LCP 1.5 s, CLS 0, TBT 20 ms.

## Known gaps

- Automated tests use text fixtures and synthetic audio. A release smoke test should still record a human voice on each operating system.
- English is the only packaged transcription model in v0.1.
- The deterministic local draft works without a key but may need more editing than a model-generated summary.
- Release packages are unsigned until the operator adds platform certificates.

## Needs operator action

- Add Apple signing/notarization secrets before a signed release: `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, and `APPLE_TEAM_ID`.
- Add the Windows Authenticode certificate secrets before a signed release: `WINDOWS_CERT_PFX` and `WINDOWS_CERT_PASSWORD`, then import that certificate in the workflow.
- Register `spoken-dev-brief` with the Sociobot billing service and set its live return URL. No product ID is hardcoded.
- Submit a live microphone smoke test after the first release assets finish publishing.

## Asset provenance

The hero was generated with the factory image model from the prompt in `.factory/design.md`. Source, prompt sidecars, optimized WebP variants, and the derived social card are committed. Walkthrough images are screenshots of the shipped demo UI.
