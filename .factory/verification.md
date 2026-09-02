# Independent verification — FAIL

- Work order: `spoken-dev-brief-verify-1`
- Candidate: `6d05bbe384d77345c8bdd65f971cfece2016fdf2`
- Live URL: <https://spoken-dev-brief.sociobot.in>
- Verified: 2026-09-02 UTC
- Result: **FAIL — release blocked**

The static deployment matches the candidate, the declared tests pass after the documented dependencies are installed, and the free local workflow is usable. The candidate still fails the acceptance contract because the paid checkout is dead, unconfirmed drafts can be exported, the real draft does not create repository references or attribution from the transcript, and the claims inventory does not prove several statements made to users.

## Release-blocking findings

### High — the live Buy Pro action is dead

The visible `Buy Pro` link targets `https://api.sociobot.in/api/v1/products/spoken-dev-brief/checkout`. A fresh GET returned HTTP 404 with:

```json
{"error":"enabled factory product","status":404}
```

This prevents purchase of the advertised `$12 / user / month` plan. The `@claim:pro-price` test passes because it checks only the displayed price and exact URL; it does not follow the URL and therefore does not prove its claim that hosted checkout works.

### High — export bypasses required human confirmation

The product promise is a confirmed decision record, and the landing page says “Confirm the record, then download Markdown or copy Jira text” and “Export only after review.” In a fresh real workspace I drafted a brief, left the review checkbox clear, and selected `Download Markdown`. The download succeeded as a 422-byte file containing `**Status:** Draft`. `Copy Jira text` is likewise enabled before confirmation; the declared Jira claim test explicitly uses it without confirming.

The UI always renders both export buttons in [src/main.ts](../src/main.ts#L96), and the handlers in [src/main.ts](../src/main.ts#L152) have no confirmed-status guard.

### High — a real draft is not attributable or code-linked as required

Input used:

> We decided to cap retries in src/lib/sync.ts:48. Assume Retry-After is seconds. Should we move the queue limit to src/config/limits.ts? Maya owns the follow-up.

The draft correctly separated one decision, assumption, and question, but produced `references: []` and `owner: Unassigned`. The implementation always initializes an empty reference list in [src/brief.ts](../src/brief.ts#L29) and does not parse ownership. Users can add these fields manually, but the researched minimum says the product proposes an attributable brief with repository references.

### High — the claims contract is incomplete and two tests do not prove their claims

- `@claim:pro-price` proves that a URL is rendered, yet the live destination is 404.
- `local-transcription-core` is not tagged `@claim:local-transcription-core` and its Rust test only resamples a zero-filled vector. It does not decode a WAV, load the packaged model, or transcribe audio, despite the declared claim saying it does.
- Claim-like published statements are absent from `.factory/claims.json`, including “It does not join calls or record in secret,” “It does not score people,” “It does not write code,” “Your speech and code are not used for model training,” and README’s “no analytics.” Under the claims contract, unlisted claims block acceptance.

## Other findings

### Medium — damaged local data makes the app unrecoverable in-product

After setting `real:spoken-dev-brief:brief` to malformed JSON and reloading `/app`, Chromium reported `SyntaxError: Expected property name or '}' in JSON at position 1`, rendered no `<h1>`, and left only the skip-link text. [src/store.ts](../src/store.ts#L28) parses stored briefs without recovery, so the user cannot reach the app’s own delete-data control.

### Medium — touch targets and history focus miss the accessibility contract

- At 390 px, the page has no horizontal overflow and axe reports no violations. However, visible mobile navigation/footer links measure 12–34 px high; the contract requires 44×44 CSS px targets.
- A normal client-side route activation focuses the new `<h1>`, but browser Back and Forward leave focus on `<body>`, not the restored page heading.
- At 320 CSS px, `/demo` expands to 390 px and horizontally scrolls. The 390 px required viewport itself passes.

### Medium — routing metadata and status are incorrect

- `/demo`, `/app`, `/privacy`, `/terms`, and the not-found view all retain the home canonical URL.
- A cold request to `/qa-missing` renders the designed in-app 404 view but returns HTTP 200, not 404.

### Medium — production caching does not meet the immutable-asset policy

The HTML, hashed JS/CSS, images, service worker, and installer files all return `cache-control: public, must-revalidate, max-age=30`. Hashed assets are not served with long-lived immutable caching as required.

### Low — committed Rust source fails formatting

`cargo fmt --manifest-path src-tauri/Cargo.toml --check` exits 1 for `src-tauri/build.rs`, `src-tauri/src/lib.rs`, and `src-tauri/src/main.rs`. Strict Clippy passes.

### Low — installer commands are not documented

`/install.sh` and `/install.ps1` are served and the shell script parses, but the README and landing page do not document the required one-line installer commands.

## First-read gate

**PASS.** A cold 1280×720 visit returns 200 and shows all required information without scrolling:

- What: “Turn spoken decisions into engineering briefs.”
- For whom: “For distributed product teams who need implementation talk linked to code and confirmed by a person.”
- What to click: “Try it with sample data.”
- Immediate outcome: “Opens a filled brief you can review and export.”

The action opens `/demo` in one click. The page immediately shows a realistic sync-policy brief and the persistent “Demo — sample data, nothing is saved” banner with `Reset demo` and `Start for real`. Reset restores the sample; leaving removes all `demo:spoken-dev-brief:*` keys and opens an empty real workspace.

Screenshots captured during verification: `/tmp/spoken-first-read.png`, `/tmp/spoken-mobile.png`, and `/tmp/spoken-mobile-demo.png`.

## Declared claim tests

All commands from `.factory/claims.json` were invoked individually. The ten Playwright commands initially could not resolve `@playwright/test` before dependency installation, as expected for a clean uninstalled checkout. After `npm ci`, every browser claim passed. The native claim initially reported missing GLib; after installing the same Linux prerequisites used by the release workflow, it passed.

| Claim | Result | Evidence |
|---|---|---|
| `demo-sandbox` | PASS | 1 Playwright test passed; only `demo:spoken-dev-brief:brief` was created by direct demo use. |
| `local-draft` | PASS | 1 test passed; decision, assumption, and question were produced. |
| `markdown-export` | PASS | 1 test passed; downloaded content contained confirmed status and the sample path. |
| `jira-export` | PASS | 1 test passed; clipboard contained `h2. Decisions`. |
| `device-private` | PASS | 1 test passed; the local demo workflow made only same-origin requests. |
| `offline-reload` | PASS | 1 test passed in its own context; live offline reload also returned the demo heading. |
| `consent-required` | PASS | 1 test passed; recording remained blocked with a specific error. |
| `retention` | PASS | 1 test passed; a brief older than the seven-day setting was removed. |
| `pro-price` | TEST PASS / LIVE FAIL | 1 fixture-level test passed, but the actual checkout returns 404. |
| `license-verify` | PASS | 1 fixture-level test passed; the live verify endpoint returned `{valid:false, reason:"invalid"}` for a bogus token. |
| `local-transcription-core` | TEST PASS / INSUFFICIENT | Rust test passed after prerequisites; it only checks resampling length, not the declared end-to-end behavior. |

## Build and static analysis

- `npm ci`: PASS; 65 packages installed, 0 audit findings.
- `npm test`: PASS; 2 Vitest tests and 15 Playwright tests passed.
- `npm run build`: PASS; wrote `dist/site/`.
- `npm run build:app`: PASS; wrote `dist/app/`.
- `npx tsc --noEmit`: PASS.
- `cargo test --manifest-path src-tauri/Cargo.toml`: PASS; 1 native test.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: PASS.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: FAIL; formatting diffs in three Rust files.
- `CI=true npm run tauri build`: PASS after installing documented Tauri Linux prerequisites plus the host `file` utility and provisioning the packaged model; produced deb, rpm, and AppImage bundles.
- `npm audit` and `npm audit --omit=dev`: PASS; 0 vulnerabilities.

No repository lint script exists.

## End-to-end and recovery evidence

- Normal local flow: PASS for manual transcript → structured draft → edit → review checkbox → confirm → Markdown download and Jira clipboard copy.
- Empty transcript: PASS; announces “No transcript was found. Paste some spoken words, then try again.”
- Consent: PASS; an unchecked consent box blocks recording and moves attention to a clear status message.
- Browser fallback: PASS; after consent, the web build explains that microphone transcription needs the installed app and offers paste fallback.
- Long/hostile text: PASS; a roughly 50 KB transcript stored and drafted, the title stayed bounded, and HTML input was escaped rather than executed.
- Retention and explicit deletion: PASS; expired data is removed and confirmed deletion clears real-mode keys.
- Corrupted local JSON: FAIL as described above.
- Draft export gate: FAIL as described above.
- Repository reference and owner extraction: FAIL as described above.

## Privacy, headers, and server behavior

- A fresh live `/app` manual-draft flow contacted only `https://spoken-dev-brief.sociobot.in` and raised no console or page errors.
- The landing page additionally makes one expected request to `https://api.github.com` for release metadata. It loads no third-party script or font and no analytics request was observed.
- Live responses include CSP, HSTS, `Referrer-Policy`, `X-Content-Type-Options`, and `Permissions-Policy`. CSP limits scripts/styles/fonts to self and allows only GitHub/Sociobot connections.
- The license verification response uses `cache-control: no-store` and allows CORS specifically for the product origin.
- Product-scoped verification rate limit: 30 rapid requests succeeded; the 31st returned HTTP 429 with `Retry-After: 3` and `X-RateLimit-After: 3`.
- Sign-in and Entra External ID: not applicable; the product has no sign-in.
- Product backend concurrency and `/data` persistence: not applicable; this is a static/local desktop app. The only server interaction is Sociobot billing/licensing.

## Accessibility, responsive behavior, and browser quality

- Axe: 0 violations of any impact on `/`, `/demo`, `/app`, `/privacy`, `/terms`, and the in-app not-found route; therefore 0 serious/critical findings.
- Semantics: `lang=en`, route-specific titles, one `<h1>`, one `<main>`, landmarks, labels, image alt text, and a skip link all present.
- Keyboard: primary controls are reachable and operable; focus has a visible 3 px gold outline. The route-change and touch-target exceptions are findings above.
- Mobile: 390×844 landing and demo have no horizontal overflow and the complete editor/export workflow remains usable.
- Reduced motion: no animations or transitions remained under `prefers-reduced-motion: reduce`.
- Console/page errors: none on clean loads of all tested routes. Malformed persisted JSON produces the documented recovery failure.

## Offline, service worker, and performance

- Live `/demo` loaded, registered `/sw.js`, reloaded, then reloaded successfully offline in a dedicated context.
- `registration.update()` completed with the current worker active, no waiting worker, and cache `spoken-dev-brief-v1` controlling the page.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100.
- Metrics: FCP 985 ms, LCP 1,285 ms, TBT 143 ms, CLS 0; first-load transfer 118,063 bytes.
- Bundles: main JS 10.36 KB gzip plus 1.01 KB gzip lazy core; CSS 4.43 KB gzip; mobile hero 45,852 bytes; all are inside budget.
- Caching: FAIL for long-lived immutable asset caching; every tested asset had `max-age=30`.

## Deployment and release identity

- A clean candidate build and live deployment had identical SHA-256 hashes for `index.html`, main JS, CSS, `sw.js`, `install.sh`, and `install.ps1`.
- Release `v0.1.0` resolves to `f806808cc4007f04a54bb6e94b75e5241535c840`. Candidate `6d05bbe...` changes only `.factory/handoff.md` from that release commit, so shipped product code matches the candidate.
- GitHub Actions run `33587827929` completed successfully for the four-platform matrix and manifest job.
- `latest.json` parses and lists macOS arm64/x64, Windows x64, and Linux x64 assets.
- Downloaded `Spoken.Dev.Brief_0.1.0_amd64.deb` (74,064,670 bytes) matches published SHA-256 `9b9f97bf73aea4d13201a6847b318785b6ace8f24bb1552e840ce2c48aff4501`.
- The deb contains the executable and a 77,704,715-byte `ggml-tiny.en.bin`. It installed successfully and remained running for a 12-second Xvfb smoke test; only expected headless EGL warnings appeared.
- The detected Linux download button points to the real v0.1.0 AppImage.

## Required fixes before release

1. Register/enable the billing product and add a live checkout assertion that follows the link.
2. Disable or reject both exports until the brief is confirmed; add negative tests for unconfirmed export.
3. Extract repository paths and explicit owners from representative transcripts, or revise the product contract and copy honestly.
4. Make every published claim explicit and observable in `.factory/claims.json`; replace the native resample-only test with packaged-model transcription coverage.
5. Recover safely from malformed or incompatible local data.
6. Fix 44 px targets, history navigation focus, canonical URLs, 404 status, and immutable asset caching.
7. Format the Rust source and document the shipped one-line installers.
