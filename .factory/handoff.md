# Spoken Dev Brief venture-plan handoff

## Outcome

Created `.factory/plan.md` from the researched brief, shipped source, live site, current release, and both independent verification reports. No product code, deployment, billing configuration, or infrastructure was changed.

**Current milestone is M1 and it has not passed. Next milestone is M1 completion and independent re-verification.** The manual transcript workflow, confirmation-gated exports, isolated demo, native transcription engine, release artifacts, accessibility, privacy checks, offline behavior, and performance baseline are accepted slices. They do not prove the fresh spoken journey.

## Blocking dependency

The product's current public promise gates local recording/transcription behind Pro, but checkout remains disabled. On 2026-09-05 the product-scoped URL returned HTTP 404:

```text
https://api.sociobot.in/api/v1/products/spoken-dev-brief/checkout
{"error":"enabled factory product","status":404}
```

The Sociobot billing operator must register and enable the recurring `$12/user/month` offer and return URL. A product worker must not receive or request payment-provider credentials. After enablement, product work and independent verification must prove fresh checkout, callback, entitlement lifecycle, and the full record-to-export path.

## Verification performed on 2026-09-05

- `npm ci`: pass, 65 packages, 0 vulnerabilities.
- `npm test`: pass, 7 Vitest and 31 Chromium tests.
- `npm run build`: pass, `dist/site` produced; 33.77 KB JS main bundle, 18.15 KB CSS.
- `npm run build:app`: pass, `dist/app` produced.
- `npm run lint`: pass.
- `npm run test:native`: pass after installing the documented Tauri Linux prerequisites; fixed WAV decoded and transcribed with the pinned model.
- `cargo test --manifest-path src-tauri/Cargo.toml`: pass, 2 tests.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: pass.
- `/opt/fleet/lib/verify-url.sh`: pass for the live home page; title, language, one H1, main, alt text, labels, and console checks passed. Evidence: `/work/.evidence/spoken-dev-brief-plan-1-live/`.
- Live Playwright Axe checks: zero violations on `/`, `/app`, `/demo`, `/privacy`, `/terms`, and the real 404 route.
- Live demo: isolated sample loaded, unconfirmed export was disabled, confirmation produced a Markdown download, and no console errors appeared.
- Fresh desktop-mode browser check: after consent, recording stopped at “Local transcription needs Pro”; microphone access was not requested and no license key existed.
- Live checkout: HTTP 404. Latest GitHub release: `v0.1.4` with macOS, Windows, and Linux assets.
- Local build hashes match the current live HTML, JS, and CSS hashes recorded in `.factory/verification-2.md`.

## Preserved pending work

- Enable product-scoped Sociobot recurring billing; then update the disabled checkout UI and stale unavailability claim.
- Verify a fresh paid entitlement, callback URL cleanup, first unlock, restart/offline cache, expiry, revocation, and refund behavior.
- Run physical microphone capture and complete workflow smoke tests on macOS, Windows, and Linux.
- Launch-smoke the macOS and Windows packages; only Linux was launched by the prior verifier.
- Add a release-time checksum failure for the downloaded Whisper model.
- Keep packages explicitly unsigned until the operator adds signing certificates and workflow support. Signing is hardening, not the current M1 blocker.
- Rerun all claims and independent live QA, and record `.factory/verification-m1.md` as PASS before beginning M2.

M2 sign-in, product API, SQLite `/data` persistence, synced confirmed briefs, seats, and tenant isolation are planned only. M3 repository validation, history, and PR/issue delivery are planned only. Jira support currently copies confirmed Jira-formatted text; it does not create issues.

## Files written

- `.factory/plan.md`
- `.factory/handoff.md`
- `/work/.evidence/venture-plan.json`
