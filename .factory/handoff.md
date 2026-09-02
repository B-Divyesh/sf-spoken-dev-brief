# Spoken Dev Brief verification handoff

## Status

**FAIL — release blocked.** Independent verification of candidate `030d32004117824b2b329e6bc0963713d04b2cdc` against <https://spoken-dev-brief.sociobot.in> completed on 2026-09-02 UTC.

The full evidence and command results are in [`.factory/verification-2.md`](verification-2.md).

## Release blocker

The researched core job requires recording and local transcription. A fresh desktop user is told “Local transcription needs Pro,” but the landing page disables checkout and the product-scoped checkout endpoint returns HTTP 404:

```text
https://api.sociobot.in/api/v1/products/spoken-dev-brief/checkout
{"error":"enabled factory product","status":404}
```

After consent, fresh desktop-mode automation confirmed that recording is blocked before the microphone is opened. Existing licenses can be restored, but new users cannot obtain one. Register/enable the product in the Sociobot billing engine and verify a fresh checkout/unlock flow before release.

## What passed

- First-read and one-click isolated demo gates.
- All 16 declared claim tests under the documented Tauri prerequisites.
- `npm test`: 7 Vitest and 31 Chromium tests.
- Typecheck, lint/format, site build, desktop UI build, 2 Rust tests, strict Clippy, and dependency audits.
- Representative draft, attribution, repository paths, confirmation gating, Markdown/Jira exports, empty/long/hostile input, damaged-storage recovery, and retention.
- Desktop and 390 px mobile, 200% text, keyboard-only operation, visible focus, reduced motion, and zero serious/critical Axe findings.
- Same-origin private demo workflow, security headers, immutable hashed-asset caching, service-worker update, and offline reload.
- License endpoint allowance: 30 requests; request 31 returned 429 with `Retry-After: 4`.
- Live static files exactly match the candidate build.
- Successful `v0.1.4` release for macOS, Windows, and Linux. A fresh DEB download matched `SHA256SUMS`, contained the pinned Whisper model, and passed a 12-second extracted-package launch smoke test.
- Lighthouse mobile: Performance 98, Accessibility 100, Best Practices 100, SEO 100; LCP 1.309 s, CLS 0, transfer 120,036 bytes.

## How to reproduce

Install Node and the documented Tauri 2 Linux prerequisites, then run:

```sh
npm ci
npm test
npm run test:native
npm run typecheck
npm run lint
npm run build
npm run build:app
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

For the blocker, open the live landing page and inspect **Pro plan**, or request the product checkout URL above. In a fresh desktop app, mark consent and choose **Start recording** without an existing license.

## Needs operator action

- Register/enable `spoken-dev-brief` with the Sociobot billing engine. This verifier did not modify billing or infrastructure.
- Configure signing secrets for a future signed release (`APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX`, with their workflow passwords). Current packages truthfully disclose that they are unsigned.
- Perform physical microphone smoke tests on each supported operating system after checkout is enabled.
