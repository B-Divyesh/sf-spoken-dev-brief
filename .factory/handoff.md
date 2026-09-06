# Spoken Dev Brief repair handoff

## Status

**M1 remains in progress and is not accepted.** The implementation repair is
`91006fd99730ff2adfb85cddba5002938f1eed13`; this handoff is a later
documentation record. The static site was deployed from that implementation on
2026-09-06 and now serves `assets/index-BN9jSBpk.js` over HTTPS.

## What changed

- Hardened the Pro entitlement client without weakening the paid boundary.
  A `?license=` checkout return stores the token, removes it from the address,
  verifies immediately, and keeps an optimistic verified result for at most one
  day. Invalid, expired, revoked, and wrong-product results keep recording
  locked before any microphone request and give a plain status message.
- Added browser regressions for callback storage/URL cleanup/verification and
  for an expired license blocking microphone access. They assert user-visible
  outcomes, not implementation text.
- Added `scripts/verify-whisper-model.sh`. The native test and every release
  build now reject a downloaded Whisper model whose SHA-256 differs from the
  pinned package checksum. A regression proves altered bytes fail the gate.
- Wrote the required billing-operator metadata to
  `/work/.evidence/billing-offer.json`: the actual Pro offer is a USD 12.00
  monthly subscription, returning to the live product origin and validating on
  the product-scoped verification path. No credentials were created, read, or
  reported.
- Added `.factory/catalog-description.txt`: “Turn spoken implementation
  decisions into confirmed, code-linked briefs.” It is verb-first and 72
  characters.

## What was verified

From a clean dependency install (`npm ci`) after installing the documented
Tauri Linux prerequisites:

- `npm test` — pass: 8 Vitest tests and 33 Chromium tests.
- Every declared claim command from `.factory/claims.json` — pass individually;
  all 16 claim IDs ran exactly once, including `npm run test:native`.
- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run build:app`,
  `cargo test --manifest-path src-tauri/Cargo.toml`,
  `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`,
  `npm audit`, and `npm audit --omit=dev` — pass.
- The native test decoded `tests/fixtures/jfk.wav`, checked the downloaded
  model checksum, loaded the packaged model, and transcribed “fellow
  Americans.”
- Static deployment used `/opt/fleet/lib/deploy-static.sh spoken-dev-brief
  dist/site`; it reused only `sf-spoken-dev-brief`, kept the existing custom
  domain, and completed successfully.
- Post-deploy `verify-url.sh` passed: HTTPS 200, route title, `lang`, one
  heading, main landmark, image alt text, labeled buttons, and no console
  errors. Axe reported zero violations on `/`, `/app`, `/demo`, `/privacy`,
  `/terms`, and the designed 404.
- Fresh desktop (1440×900) and phone (390×844) visits both showed, without
  scrolling: the job “Turn spoken decisions into engineering briefs,” the
  audience (distributed product teams), and “Try it with sample data.”
- The post-deploy sample loaded Maya Chen’s populated retry brief with two
  repository references and the persistent demo label. Reset restored the
  sample and left a seeded real workspace unchanged.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 905 ms, LCP 1,782 ms, TBT 28 ms, CLS 0, and 120,067 bytes
  transferred. Evidence:
  `/work/.evidence/spoken-dev-brief-repair-2-lighthouse.json`.

## Earlier findings and current disposition

The prior repair findings remain fixed: confirmation gates both exports,
drafting extracts owner and repository paths, corrupted local storage recovers,
mobile targets/text zoom/history focus/404/canonicals/cache headers pass, and
the claim inventory covers public privacy and product-limit statements. The
remaining release-workflow checksum omission is now fixed by the new integrity
gate.

## Blocking external dependency

The product-scoped checkout still returned HTTP 404 on 2026-09-06:

```text
https://api.sociobot.in/api/v1/products/spoken-dev-brief/checkout
{"error":"enabled factory product","status":404}
```

This is the M1 blocker. Pro recording/transcription must remain paid, so the
product correctly keeps checkout unavailable rather than pretending payment
works or making the deliverable free. The billing-registration operator must
enable the `spoken-dev-brief` recurring USD 12/month offer with return URL
`https://spoken-dev-brief.sociobot.in/`. Then change the disabled checkout
control, replace the unavailable-checkout claim with an outcome-based live
checkout claim, and independently verify fresh purchase, active entitlement,
restart/offline cache, expiry, revocation, and refund.

## Remaining M1 verification

- Exercise consent → microphone → local transcription → review → confirmation
  → export with a fresh paid entitlement on supported installed packages.
- Launch-smoke the macOS and Windows packages and perform microphone checks on
  macOS, Windows, and Linux. The fixed-WAV engine test is not a physical
  microphone test.
- Keep packages unsigned until the operator supplies signing certificates;
  this is disclosed but not an M1 substitute for checkout registration.

M2 accounts, product-owned SQLite under `/data`, sync, tenancy, and seats;
and M3 repository validation/history/delivery are still planned only and were
not started.
