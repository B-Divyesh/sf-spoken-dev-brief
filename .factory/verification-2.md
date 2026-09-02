# Independent verification 2 — FAIL

- Work order: `spoken-dev-brief-verify-2`
- Candidate: `030d32004117824b2b329e6bc0963713d04b2cdc`
- Live URL: <https://spoken-dev-brief.sociobot.in>
- Verified: 2026-09-02 UTC
- Result: **FAIL — release blocked**

The repaired site, demo, local drafting and export workflow, native Whisper engine, desktop release, accessibility baseline, offline behavior, privacy behavior, and deployment parity all pass. The candidate still does not complete the researched job for a new user: recording and local transcription require Pro, but checkout is unavailable and the product checkout endpoint returns HTTP 404. A fresh desktop user is therefore limited to pasting a transcript.

## Release-blocking finding

### High — a new user cannot record or transcribe speech

The researched minimum is a local-first recorder that transcribes selected speech. The product gates that path behind Pro and tells a fresh desktop user:

> Local transcription needs Pro. Paste a transcript for free or add your license from the home page.

Fresh desktop-mode automation marked consent, selected **Start recording**, and observed that message. `getUserMedia` was never called and there were no saved license keys.

The landing page advertises Pro at `$12 / user / month`, but renders the checkout anchor as `aria-disabled="true"` and prevents navigation. A fresh request to the exact product-scoped URL returned:

```text
GET https://api.sociobot.in/api/v1/products/spoken-dev-brief/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

Existing license restoration works, but a new customer cannot obtain a license. This also leaves an intentionally disabled, non-working URL in the page's link set. Truthful “purchase registration is pending” copy does not make the required recorder or specified subscription work end to end.

Required fix: register/enable `spoken-dev-brief` in the Sociobot billing engine, expose the working product-scoped checkout action, and verify a fresh purchase/unlock path. Do not connect a payment provider directly.

## First-read gate — PASS

A cold visit at 1440×900 and 390×844 answers all three questions in the initial viewport:

- What: “Turn spoken decisions into engineering briefs.”
- For whom: “For distributed product teams who need implementation talk linked to code and confirmed by a person.”
- First action: “Try it with sample data,” followed by “Opens a filled brief you can review and export.”

The desktop CTA begins at 778 px and the mobile CTA at 715 px. One click opens `/demo`, already filled with a realistic sync-retry brief. The persistent banner says “Demo — sample data, nothing is saved” and includes **Reset demo** and **Start for real**. Demo data uses only `demo:spoken-dev-brief:*`; the separate `release:spoken-dev-brief` key caches public GitHub release metadata. Leaving demo removes demo keys.

## Claim contract

`.factory/claims.json` exists and declares 16 claims. Every listed command was run independently after `npm ci`; every browser claim passed. The native command initially exited 101 in the base worker because GLib/WebKit development libraries were not installed. After installing the repository's documented Tauri Linux prerequisites—the same packages used by the release workflow—the exact command passed. This is an environment prerequisite, not a failed supported-environment assertion.

| Claim | Result | Evidence |
|---|---|---|
| `demo-sandbox` | PASS | Sample loaded; demo-prefixed data only; reset and exit worked. |
| `local-draft` | PASS | Decision, assumption, question, owner, and both repository paths were extracted. |
| `markdown-export` | PASS | Confirmed Markdown downloaded with status and repository path. |
| `jira-export` | PASS | Confirmed Jira text copied with `h2. Decisions`. |
| `device-private` | PASS | Demo draft flow contacted only the product origin. |
| `offline-reload` | PASS | Dedicated context reloaded `/demo` offline. |
| `consent-required` | PASS | Recording stayed blocked until consent was marked. |
| `retention` | PASS | Expired brief was removed under the seven-day setting. |
| `pro-price` | PASS as written / product FAIL | Price and truthful unavailable state are tested; live checkout remains 404. |
| `license-verify` | PASS | Fixture restored a valid existing license; live invalid-token response was handled. |
| `local-transcription-core` | PASS | Model checksum, WAV decode, Whisper inference, and spoken-word assertion passed. |
| `no-covert-recording` | PASS | No microphone call occurred before consent. |
| `no-people-scoring` | PASS | Saved schema had no score, rank, or rating fields. |
| `no-code-writing` | PASS | Drafting wrote only local brief data and made no network write. |
| `no-model-training` | PASS | Transcript drafting contacted only the product origin. |
| `no-analytics` | PASS | Demo and policy routes made no analytics or tracking request. |

Each claim ID occurs exactly once as `@claim:<id>` in test sources. Published landing/README promises are represented in the inventory, including the product's explicit limits.

## Clean build and static analysis

Executed from the candidate checkout:

```text
npm ci                                      PASS — 65 packages, 0 vulnerabilities
npm test                                    PASS — 7 Vitest + 31 Chromium tests
npm run test:native                         PASS — 1 real WAV/Whisper claim test
npm run typecheck                           PASS
npm run lint                                PASS — TypeScript + cargo fmt
npm run build                               PASS — dist/site
npm run build:app                           PASS — dist/app
cargo test --manifest-path src-tauri/Cargo.toml
                                             PASS — 2 tests
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
                                             PASS
npm audit                                   PASS — 0 vulnerabilities
npm audit --omit=dev                        PASS — 0 vulnerabilities
```

Site output is 33.77 KB JS (11.67 KB gzip), 2.48 KB lazy JS (1.01 KB gzip), and 18.15 KB CSS (4.78 KB gzip). There are no third-party fonts or scripts.

## End-to-end and recovery evidence

- Representative transcript: extracted owner `Maya Chen`, `src/lib/sync.ts:48`, and `src/config/limits.ts`, while separating a decision, assumption, and question.
- Confirmation gate: Markdown and Jira controls were disabled before review; keyboard confirmation enabled both.
- Exports: downloaded Markdown contained `**Status:** Confirmed` and the code path; clipboard contained Jira headings.
- Empty input: announced “No transcript was found. Paste some spoken words, then try again.”
- Boundary input: a roughly 54 KB transcript was stored and drafted without executing embedded HTML.
- Damaged storage: malformed brief JSON was removed, one `<h1>` remained, and an alert explained how to recover.
- Retention, editing-after-confirmation, explicit deletion, and history focus paths pass the repository regressions.
- Normal local drafting and export made requests only to `https://spoken-dev-brief.sociobot.in` and produced no console or page errors.
- Fresh paid recording is blocked as described in the release finding.

## Accessibility, responsive behavior, and browser quality

- Axe found zero serious or critical violations on `/`, `/demo`, `/app`, `/privacy`, `/terms`, and the designed 404. It found zero violations of any impact on these routes.
- Every tested page has `lang=en`, one `<h1>`, one `<main>`, a route-specific title and canonical, landmarks, labels, alt text, and a skip link.
- Keyboard traversal showed a designed 3 px gold focus outline on links, buttons, inputs, and textareas. Keyboard-only confirmation and export work without a trap.
- At 390 px, the complete demo has no horizontal overflow or undersized visible links/buttons/form controls. At 200% text size it still has no horizontal overflow.
- With `prefers-reduced-motion: reduce`, no running animations remained.
- The normal desktop and mobile routes produced no console/page errors. Loading the deliberate `/qa-missing` document returns 404 and Chromium logs the expected failed-resource network message; product JavaScript raises no error.
- `/qa-missing` returns a real HTTP 404 with a styled way home.

## Privacy, headers, and rate limiting

- The live demo → reset → local draft → privacy → terms sequence contacted only the product origin. No analytics, tracking, external script, or external font request appeared.
- The landing page makes one documented request to `api.github.com` for release metadata.
- Live responses include CSP, HSTS, `Referrer-Policy`, `X-Content-Type-Options`, and `Permissions-Policy`. CSP limits scripts/styles/fonts to self and allows only the documented GitHub and Sociobot connections.
- Hashed JS/CSS return `public, max-age=31536000, immutable`; HTML/service worker use revalidation/no-cache policies.
- Live invalid license verification returned HTTP 200, `{valid:false, reason:"invalid"}`, `Cache-Control: no-store`, and product-origin CORS.
- Observed product verify allowance: requests 1–30 returned 200; request 31 returned 429 with `Retry-After: 4`.
- Sign-in/Entra External ID is not applicable; the product has no sign-in.
- Product backend concurrency and `/data` persistence are not applicable; the product is a static/local Tauri app. No out-of-scope resource, service setting, secret, database, or storage was read.

## Offline and performance

- `/demo` registered the current service worker, updated successfully with no waiting worker, and reloaded offline with HTTP 200.
- Only cache `spoken-dev-brief-v2` remained after update; the old cache was absent.
- Fresh Lighthouse mobile: Performance 98, Accessibility 100, Best Practices 100, SEO 100; FCP 964 ms, LCP 1,309 ms, TBT 161 ms, CLS 0, transfer 120,036 bytes. Report: `/tmp/spoken-lighthouse-2b.json`.
- The local production bundle, CSS, and mobile hero remain below the stated budgets.

## Deployment and desktop release identity

Fresh candidate build hashes exactly match the live site:

```text
index.html                    472b9fd0da4f7e3374c6043836688a9df65c56a94716fe946c157fe5d387fd62
assets/index-BdHvoTdX.js     2a98077edadb3691ef579e4b147dd0cba8a0c186d56f212e87629df4d1080186
assets/index-By8IkWWK.css    faf166e48dc4d9fafe4c6e66d6fc854fc4b52c72ae6020881ea02849f0ac3ddb
sw.js                         f0e530d4467c1ad6026a417090ce6b0a134398627ff6a2e7b2194f01a12acd85
install.sh                    8c5ba31b40746c3e32ddb7c1ffc872ad3d70ba837c9334a5d95e82551e52d37f
install.ps1                   7fcf2504f08f02de6e73f92e978b2bf7e7993501757328ef3a34359b2487f1c7
```

Candidate `030d320…` differs from release tag `v0.1.4` (`23d16ec…`) only in `.factory/handoff.md`, so all shipped application code is identical. GitHub Actions run `33598686924` completed successfully for macOS arm64/x64, Windows x64, Linux x64, and the manifest job.

Release `v0.1.4` includes DMG, EXE, MSI, AppImage, DEB, RPM, app archives, `latest.json`, and `SHA256SUMS`. The manifest lists all four platform targets. A fresh 74,154,522-byte DEB download matched published SHA-256 `85786a57132abde29ef8d7c97825f021a9ca4fe557f300cc6bd8b1a70b69f5d9`. Its extracted model matched the pinned hash, and the extracted application stayed running under Xvfb for the 12-second smoke window. The live Linux download button points to the real v0.1.4 AppImage.

## Known test limits

- Physical microphone permission and audio capture were not exercised on human macOS, Windows, and Linux desktops. The WAV/Whisper core and permission gating were automated.
- macOS and Windows packages were produced by successful native GitHub runners but were not launched in this Linux worker.
- Packages are unsigned, which the landing page and release notes disclose.

## Decision

**FAIL.** Do not release until a fresh user can purchase/obtain the required Pro license and complete consent → recording → local transcription → review → confirmation → export. All other observed acceptance areas pass.
