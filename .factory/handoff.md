# Spoken Dev Brief verification handoff

## Status

**FAIL — do not release candidate `6d05bbe384d77345c8bdd65f971cfece2016fdf2`.**

Independent QA was performed on 2026-09-02 against the clean candidate checkout and <https://spoken-dev-brief.sociobot.in>. The live deployment's product code matches the candidate. Full evidence is in [verification.md](verification.md).

## Release blockers

1. The live `Buy Pro` action returns HTTP 404, so the advertised `$12 / user / month` subscription cannot be purchased.
2. Markdown and Jira exports work while the brief is still a draft, bypassing the required human-confirmation gate.
3. A representative transcript containing two repository paths and a named owner produced no references and `Unassigned`, so the proposed brief is neither code-linked nor attributable.
4. The claims inventory is incomplete. The Pro test never follows its dead checkout link; the native transcription claim only tests resampling and has no matching `@claim` tag; several published privacy and non-goal statements are unlisted.

Additional medium findings: malformed saved JSON crashes the app before recovery controls render; several mobile links are below the 44 px touch-target minimum; Back/Forward does not restore focus; non-home routes retain the home canonical URL; missing pages return HTTP 200; hashed production assets receive only 30-second caching.

## What passed

- First-read gate and one-click isolated sample demo.
- All declared claim commands after installing dependencies, plus the aggregate unit/integration suite.
- TypeScript, production site/app builds, Rust tests, strict Clippy, and a full Tauri Linux bundle build. Rust formatting is the one static-analysis failure.
- Normal transcript, editing, confirmation, export, retention, deletion, consent, browser fallback, and offline demo flows.
- No clean-load console/page errors, no axe violations, visible keyboard focus, reduced motion, and responsive use at 390 px.
- Privacy request inspection, security headers, and product verification throttling: 30 requests were allowed; request 31 returned 429 with `Retry-After: 3`.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 1.285 s, CLS 0.
- Candidate/live static hashes, GitHub release manifest, published checksum, deb contents, installation, and headless launch smoke test.

## Reproduce

```sh
npm ci
npm test
npm run build
npm run build:app
npx tsc --noEmit
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo fmt --manifest-path src-tauri/Cargo.toml --check
```

The final command currently fails. Building Tauri packages on Debian also requires the Linux prerequisites from the release workflow, the `file` utility, and the packaged model resource.

## Scope notes

- No product code was changed during verification.
- No resources outside this product's public site, public repository/release, and product-scoped Sociobot billing endpoints were accessed.
- No backend persistence or sign-in exists, so `/data`, concurrency, and Entra checks do not apply.
- Human microphone transcription still needs a real-device smoke test on each supported operating system after the release blockers are fixed.
