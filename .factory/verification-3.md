# Independent verification 3 — FAIL

- Work order: `spoken-dev-brief-verify-3`
- Current milestone: **M1 — local spoken brief (in progress, not accepted)**
- Implementation candidate reviewed: `91006fd99730ff2adfb85cddba5002938f1eed13`
- Documentation candidate reviewed: `a5ec963fd814dfacc16dfde68bcd6b260500791e`
- Live URL: <https://spoken-dev-brief.sociobot.in>
- Verified: 2026-09-06 UTC
- Verdict: **FAIL — 1 high finding, 0 untested declared claims**

## Finding

### High — fresh users cannot buy Pro or start the required recording flow

M1 promises a fresh customer can complete consent → microphone capture → local
transcription → review → confirmation → export. Recording correctly remains
behind Pro, and the browser does not request a microphone without an active
license. However, no fresh customer can obtain that license: the live landing
page truthfully disables its checkout control and a direct request to the
product-scoped checkout URL returned HTTP 404:

```text
GET https://api.sociobot.in/api/v1/products/spoken-dev-brief/checkout
HTTP 404
{"error":"enabled factory product","status":404}
```

This is an external billing-registration dependency, not a repository repair.
The required operator action is to enable the recurring USD 12/user/month
`spoken-dev-brief` offer with return URL
`https://spoken-dev-brief.sociobot.in/`. Do not make Pro free or replace the
Sociobot checkout. After registration, independently verify a fresh checkout,
active callback, restart/offline cache, expired/revoked/refunded entitlement,
and the physical microphone-to-export journey.

## First read and demo

Fresh desktop (1440 × 900) and phone (390 × 844) visits both showed before
scrolling:

- Job: “Turn spoken decisions into engineering briefs.”
- Audience: distributed product teams linking implementation talk to code.
- First action: “Try it with sample data,” with the result stated beside it.

The one-click demo opened a populated retry-policy brief with owner Maya Chen
and repository references. Its persistent label read “Demo — sample data,
nothing is saved.” Reset restored the sample. A seeded real workspace remained
unchanged throughout demo use and reappeared after **Start for real**; demo
used only `demo:spoken-dev-brief:*` keys.

## Declared claim contract

All 16 entries in `.factory/claims.json` have exactly one matching claim tag
and every declared command passed from the clean dependency install. There are
**0 untested declared claims**.

| Claim IDs | Result | Evidence |
|---|---|---|
| `demo-sandbox`, `local-draft`, `markdown-export`, `jira-export` | PASS | Isolated sample; named owner and paths; confirmed Markdown download and Jira clipboard text. |
| `device-private`, `offline-reload`, `consent-required`, `retention` | PASS | Same-origin demo workflow; dedicated offline reload; consent block; expired brief removal. |
| `pro-price`, `license-verify` | PASS as written | Truthful disabled checkout/price and fixture restoration both work. The live checkout 404 is the finding above. |
| `local-transcription-core` | PASS | `npm run test:native` checksum-checked the packaged model, decoded `jfk.wav`, and transcribed “fellow Americans.” |
| `no-covert-recording`, `no-people-scoring`, `no-code-writing`, `no-model-training`, `no-analytics` | PASS | Browser request/schema assertions passed. |

## Quality and live checks

- `npm ci` completed from the clean checkout with 0 dependency vulnerabilities.
- `npm test`: PASS — 8 Vitest tests and 33 Chromium tests. Playwright Axe found no serious or critical violations on `/`, `/app`, `/demo`, `/privacy`, `/terms`, or the designed 404.
- `npm run test:native`: PASS after installing the repository release workflow’s documented Linux Tauri prerequisites. The first attempt correctly exposed the absent `glib-2.0` system dependency; no product code changed.
- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run build:app`, `cargo test --manifest-path src-tauri/Cargo.toml`, `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`, `npm audit`, and `npm audit --omit=dev`: PASS.
- `verify-url.sh` passed against the live origin. It found HTTPS 200, the expected title/lang/main/heading/alt structure, and no application console error. The standalone Axe CLI could not locate a system Chrome binary in this image; Playwright’s installed Chromium and repository Axe integration supplied the required accessibility check instead.
- Live normal, empty, boundary, and recovery checks passed. An empty transcript gives an actionable message; a 63,315-byte saved brief drafted successfully; malformed saved JSON is removed with an in-product recovery alert.
- Live routes have one `<h1>`, one `<main>`, and route-specific titles. `/qa-missing` deliberately returns HTTP 404 with the designed return-home page; its browser failed-resource console line is expected, not a product JavaScript error.
- At 390 px and at 200% text, the tested routes did not overflow. Keyboard confirmation/export, Back/Forward heading focus, 44 px visible mobile navigation/footer targets, and reduced motion passed. Reduced-motion live inspection had zero running animations.
- Live privacy capture during demo/manual use had only the product origin; the landing page’s documented public GitHub release-metadata request is the sole extra origin. There are no third-party fonts, scripts, analytics, or tracking requests in the tested flow.
- Live headers include CSP, HSTS, Referrer-Policy, X-Content-Type-Options, and Permissions-Policy. Hashed assets are immutable and the service worker is no-cache. The invalid-license endpoint allowed requests 1–30, then returned request 31 as HTTP 429 with `Retry-After: 2`.
- Lighthouse mobile: Performance 94, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.3 s, TBT 290 ms, CLS 0, transfer 117 KiB. Report: `/work/.evidence/spoken-dev-brief-verification-3-lighthouse.json`.
- Fresh local production build hashes match live `index.html`, `index-BN9jSBpk.js`, `index-By8IkWWK.css`, and `sw.js` exactly.

## Desktop artifact

The current release is `v0.1.4`. A clean Linux consumer check downloaded
`Spoken.Dev.Brief_0.1.4_amd64.deb`; its SHA-256 matched published
`SHA256SUMS`. The package extracted in a fresh temporary directory and its
binary remained running for a 12-second Xvfb smoke window. Evidence is in
`/work/.evidence/verification-3-artifact/`.

This environment cannot make a physical microphone check or launch macOS and
Windows packages. Those checks remain required after the billing dependency is
removed; they are not represented as a shipped fresh-customer success.

## Earlier findings disposition

| Earlier finding | Current disposition |
|---|---|
| Dead fresh checkout | **Still open** as the high finding above. The control is now deliberately disabled and explains the state, but that does not complete M1. |
| Export before confirmation | Fixed; both export controls are disabled until confirmation and regressions pass. |
| Missing owner/repository extraction | Fixed; realistic transcripts produce the named owner and both repository paths. |
| Missing/untagged claim coverage | Fixed; inventory has 16 exact tags and all declared commands passed. |
| Damaged storage crash | Fixed; corrupt JSON is removed with a recovery alert and usable empty state. |
| Mobile target size, Back/Forward focus, 320 px overflow, 200% text | Fixed; regressions and live 390 px checks pass. |
| Route canonical/404 status | Fixed; canonicals update by route and unknown paths return real HTTP 404. |
| Asset cache policy | Fixed; hashed assets are immutable and shell/service-worker policies are appropriate. |
| Rust formatting and installer documentation | Fixed; strict lint passes and both installer commands are documented. |
| Release-time Whisper integrity | Fixed; altered-model regression and release checksum gate pass. |

## External dependency

Only the Sociobot billing operator can remove the current blocker by registering
the product-scoped recurring offer. M2 accounts, SQLite persistence, tenancy,
and sync remain planned capabilities, not acceptance requirements for M1.

## Decision

**FAIL.** The candidate is otherwise verified, but M1 cannot pass while a new
customer cannot buy the required Pro entitlement and complete the real spoken
capture journey.
