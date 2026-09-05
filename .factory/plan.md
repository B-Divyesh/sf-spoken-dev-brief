# Spoken Dev Brief venture plan

Plan date: 2026-09-05

Product: `spoken-dev-brief`

Artifact: Tauri 2 desktop app plus a static product site

Live site: <https://spoken-dev-brief.sociobot.in>

Current release: `v0.1.4`

## Milestone decision

**Current milestone: M1 — local spoken brief. Status: IN PROGRESS, NOT PASSED.**

**Next milestone: finish and independently verify M1. Do not start M2.** A fresh user cannot obtain the Pro entitlement that the current desktop app requires before it opens the microphone. The public checkout control is disabled, and the product-scoped checkout endpoint returned HTTP 404 on 2026-09-05. Physical microphone capture and installed-app launch also still need human smoke tests on every supported operating system.

The labels in this plan are strict:

- **Accepted** means the behavior passed a repository test and, where applicable, was observed on the matching live build.
- **Demonstrated** means a component or fixture worked, but the real user journey or external service was not proved.
- **Planned** means no shipped capability is claimed.

No M1–M3 milestone has passed as a whole. Passing parts of M1 remain useful evidence, but they do not promote the product to M2.

## Current product truth

| Capability | Status | Evidence and limit |
|---|---|---|
| Landing page and one-click sample | Accepted | `/demo` opens a filled, isolated workspace. `.factory/verification-2.md` and `@claim:demo-sandbox` cover it. |
| Manual transcript to structured draft | Accepted | Local rules extract decisions, assumptions, questions, an owner, and repository paths. `@claim:local-draft` and `tests/brief.test.ts` cover representative input. |
| Human review gate | Accepted | Markdown and Jira text stay disabled until confirmation; editing a confirmed brief returns it to draft. `tests/repair.spec.ts` covers both paths. |
| Markdown download and Jira-formatted clipboard text | Accepted | `@claim:markdown-export` and `@claim:jira-export` pass. This is not a direct Jira API integration. |
| Local namespaces, retention, deletion, and damaged-data recovery | Accepted | Demo and real keys are separate. Retention and recovery tests pass. This is device-local separation, not tenant isolation. |
| Offline browser demo | Accepted | A dedicated browser context reloads `/demo` offline after its first visit. This does not prove an installed desktop capture while offline. |
| Native WAV decoding and Whisper transcription | Accepted as an engine component | The fixed WAV is decoded by the packaged `tiny.en` model and asserted for spoken words. It does not exercise a physical microphone. |
| Desktop release artifacts | Accepted as published artifacts | Release `v0.1.4` has macOS arm64/x64, Windows x64, and Linux packages plus checksums. The Linux DEB was checksum-verified and launch-smoked. macOS and Windows were built on native CI but not launched by the verifier. |
| Fresh microphone-to-brief journey | Not accepted | Recording is stopped before `getUserMedia` for an unlicensed user. A sample brief and a WAV fixture do not prove the real journey. |
| Subscription checkout | Not implemented | The page truthfully says checkout is unavailable. The exact product endpoint currently returns 404. Displaying `$12/user/month` is not billing. |
| Existing-license restoration | Demonstrated only | A fixture proves the UI accepts a valid response. Live verification handled an invalid token. No live valid entitlement or purchase callback was verified. |
| Sign-in, accounts, team workspaces, and tenant isolation | Not implemented | There is no auth layer, product API, server database, or tenant model. Local storage prefixes do not prove tenant isolation. |
| Direct issue-tracker delivery | Not implemented | Markdown download and Jira-formatted clipboard copy are the only exports. |
| Pilot success target | Not measured | No evidence yet shows that 60% of pilot recordings become approved briefs or are used from a PR/issue within seven days. |

### Current public promises

The live site may currently claim only what the shipped tests prove: the isolated sample, manual local drafting, editable attribution and repository paths, confirmation-gated Markdown/Jira-text export, local retention controls, no analytics in the tested flow, and published unsigned packages. It may say that Pro is listed at `$12/user/month` only while it also says that new checkout is unavailable.

“Recorder,” “local transcription,” or the three-step record-to-export journey must not be treated as available to a fresh customer until M1 passes. “Jira export” means copied Jira-formatted text, not issue creation. Nothing may imply that accounts, cloud sync, tenant isolation, or team seat billing exist.

## PRD

### Customer and situation

Small distributed product teams make implementation decisions aloud during pairing, reviews, and short calls. Today they copy a meeting summary into a ticket, lose a voice note, or leave a decision detached from the code path it changed. They want a private record near the repository, with a named owner and a required human check.

### Product promise

Turn selected, consented speech into a confirmed, code-linked engineering brief without sending the recording to another meeting silo.

### Three jobs the product must nail

1. **Capture the decision.** Record only after explicit consent and transcribe locally with a clear recording state and recoverable errors.
2. **Make it accountable.** Propose decisions, assumptions, open questions, owners, and repository references; let a person edit and confirm every field.
3. **Put it back into development work.** Export only confirmed briefs in portable formats and associate them with the repository issue or pull request where the decision is used.

### Monetization

The researched offer is a recurring **Pro subscription at `$12 per user per month`** for local transcription, model updates, and future team integrations. The free path keeps manual transcript entry, review, repository references, and export useful without an account.

Only the Sociobot billing API may sell or verify Pro. Dodo remains behind Sociobot as merchant of record. No payment-provider SDK or secret belongs in this repository or client. Billing is currently unavailable and must not be described as implemented.

### Deliberately out of scope through M3

- Meeting bots, passive/background capture, or covert recording.
- HR analytics, speaker scoring, attendance tracking, or employee monitoring.
- Autonomous code changes or automatic approval of a brief.
- Uploading raw audio for hosted transcription.
- Training a model on speech, transcripts, repository content, or briefs.
- Broad repository indexing or sending source code to a model.
- A direct Jira API integration; Jira-formatted clipboard export remains the supported Jira path through M3.
- Mobile-native clients, real-time multiplayer editing, email campaigns, and chat notifications.

### Success measure

For a consented pilot set, at least 60% of recordings must result in a human-confirmed brief. Every confirmed pilot brief must record whether it was opened from an associated PR or issue within seven days. Measurement is local and participant-exported; no hidden analytics are added. Report the cohort size, both numerators and denominators, operating systems, failures, and exclusions.

## Evidence and wedge

- A macOS user asked for a meeting-transcription daemon after losing the ability to export Granola notes to Obsidian: <https://hn.algolia.com/api/v1/items/48936123> (2026-07-16).
- A Codex IDE request for push-to-talk voice transcription received 265 reactions: <https://github.com/openai/codex/issues/3000> (2025-08-31).
- Both signals ask for voice capture that stays portable and near development work. Meeting transcription products create generic summaries; issue trackers preserve decisions only after someone rewrites them. The wedge is a private, code-linked decision record that cannot be exported as final until a person confirms it.

## Architecture

### What exists now

- **Static site/PWA:** Vite and TypeScript build `dist/site`. It serves `/`, `/app`, `/demo`, `/privacy`, `/terms`, and a real 404. A service worker caches the shell and sample for offline use.
- **Desktop:** Tauri 2 builds the same TypeScript interface in `dist/app`. Browser audio is held in memory, encoded as mono WAV, and passed to the Rust command `transcribe_wav`.
- **Local transcription:** Rust uses `hound` and `whisper-rs` with the packaged, checksum-known `ggml-tiny.en.bin` model. No runtime model gateway is used.
- **Drafting:** deterministic TypeScript rules classify sentences and extract owner-like names and path-like strings. This is not presented as hosted AI.
- **Storage:** one current brief and settings are stored in WebView/browser `localStorage`. Demo keys start `demo:spoken-dev-brief:` and real keys start `real:spoken-dev-brief:`. License token/cache and public GitHub release metadata have separate keys.
- **External calls:** the landing page reads public release metadata from `api.github.com`. License verification calls only the product-scoped Sociobot endpoint when a token exists. There is no product backend, SQLite database, account, sync, email, or analytics.

### Target shape by M2

Keep capture, audio, transcription, draft generation, and the default brief store local. Add a small product-owned Rust/axum API only for optional accounts, team membership, entitlements, and explicitly enabled sync of confirmed brief content. Deploy it as `sf-spoken-dev-brief-api`, one replica, with its SQLite database at `/data/spoken-dev-brief.sqlite3`. No shared PostgreSQL or another service's storage is allowed.

The API model is deliberately small:

- `workspaces(id, name, created_at, deleted_at)`
- `members(workspace_id, subject_id, role, created_at)`
- `entitlements(workspace_id, sociobot_product, plan, status, seats, expires_at, checked_at)`
- `briefs(id, workspace_id, owner_subject_id, title, status, body_json, source_repo, source_revision, version, created_at, confirmed_at, deleted_at)`
- `audit_events(id, workspace_id, actor_subject_id, action, object_id, created_at)` with no transcript, audio, token, or source-code body

Every server row that belongs to a customer carries `workspace_id`. Each request derives workspace access from the verified identity and membership row; client-supplied workspace IDs never grant access. SQLite foreign keys stay enabled. Writes use transactions, and optimistic `version` checks prevent silent overwrite.

### Authentication and authorization

There is no sign-in now. M2 may add optional Sociobot Entra CIAM sign-in after the operator creates a product-scoped application registration and supplies public configuration through the approved deployment path. The desktop uses authorization code with PKCE and the system browser. The API validates issuer, audience, signature, expiry, and membership. Roles are `owner`, `editor`, and `viewer`; billing changes require `owner`. Free local use and demo mode remain accountless.

### Billing

The client opens only `https://api.sociobot.in/api/v1/products/spoken-dev-brief/checkout` and verifies only through the matching product route. The billing operator must register the recurring `$12/user/month` product and return URL. The app stores a product license/entitlement locally, strips it from the callback URL, and reconciles no more than daily. M2 associates verified entitlements with a workspace and enforces seats server-side. No raw provider credentials enter the app, logs, documentation, or tests.

### Background work and operations

M1 has no server jobs. In M2, one product API process performs entitlement reconciliation, expired-session cleanup, and SQLite online backups under `/data/backups`; all jobs are idempotent and lease-protected for the single-replica deployment. Add `/healthz` and `/readyz`, structured logs with request IDs, and counters for status codes and latency. Logs must exclude audio, transcript/brief bodies, repository content, license tokens, and identity tokens. Rate-limit auth callbacks, entitlement checks, writes, export, and deletion by subject plus IP.

M2 must prove backup and restore using a disposable database. Account export returns the customer's metadata and synced confirmed briefs. Account deletion revokes sessions, deletes server rows, and explains that local device copies need separate deletion. No transactional email is required through M3.

### Data boundaries

| Data | Current boundary | M2/M3 boundary |
|---|---|---|
| Microphone audio/WAV | Memory only, then passed to local Rust; no persistent audio store is implemented. | Always device-only and transient. Never sync or log it. |
| Transcript | Real/demo localStorage namespace. | Device-only by default. Never sync in the M1–M3 plan. |
| Draft brief | Device-local, one brief per namespace. | Device-local by default. Only a user-selected, confirmed brief may sync. |
| Confirmed synced brief | Not implemented. | Product API SQLite row scoped by `workspace_id`; exclude source transcript unless the user explicitly exports it as a file. |
| Repository content | Only path strings typed or parsed from transcript. | Local repository picker may read paths and revision metadata; source contents never leave the device. |
| Consent | Checkbox state gates capture but is not persisted as an audit record. | Keep the gate; store only a local capture timestamp if the user opts to retain it. Do not store participant identities. |
| Settings | Real/demo localStorage namespace. | Stay device-local unless a non-sensitive preference is explicitly synced. |
| License/entitlement | Product token and daily verdict cache in localStorage. | Move desktop secrets to OS-protected storage; server stores only the minimum Sociobot entitlement reference/status. |
| Account/team metadata | Not implemented. | Product-owned SQLite on `/data`; never shared with another product database. |
| Demo data | `demo:` local namespace; no account/backend access. | Remains a sealed local namespace and must never call authenticated product APIs. |

## Design system contract

The source of truth remains `.factory/design.md`: an art-deco transit-poster instrument where a spoken decision follows a visible route into a durable paper record. Keep the identity; do not replace it with a generic dashboard.

- **Palette:** ink `#172522`, paper `#f4eddd`, recessed paper `#e8ddc6`, signal red `#b52b32`, pressed red `#7d1c24`, brass `#b27a28`, confirmed teal `#1d5b58`, muted `#58635e`, danger `#9b2226`, success `#17634f`, warning `#7a4c00`.
- **Type:** system-installed geometric sans for display/controls and readable old-style serif for body/transcript. No CDN fonts.
- **Scale:** an 8 px spacing rhythm, reading measure near 68 characters, 1184 px maximum layout, stepped corners, parallel rules, and 44 px minimum targets.
- **Motion:** 180–240 ms opacity/transform transitions. The stage marker shows progress; the consent lamp moves only while recording. Reduced motion removes all movement.
- **Accessibility:** one `<h1>`, ordered headings, landmarks, skip link, explicit labels/errors, live announcements, 3:1 focus indicator, 4.5:1 body contrast, keyboard parity, 200% text support, no horizontal loss at 320/390 px, and correct dialog focus when account screens arrive.

The component set is: site header/nav, hero/download action, demo banner, stage rail, consent panel/lamp, record control, transcript editor, brief section editor, repository-reference row, status badge, confirmation gate, export actions, toast/live region, storage settings, pricing/license panel, release chooser, account/entitlement panel, brief history, legal page, and 404 state. Every applicable component needs empty, loading, success, error, offline, disabled, and focus states.

Five key screens:

1. **Landing/download:** job, audience, sample action, three facts, live preview, limits, truthful price/availability, and detected package.
2. **Capture workspace:** consent, input source, recording/transcription progress, transcript correction, and recovery.
3. **Brief review:** editable sections, owner, repository references, draft/confirmed state, and confirmation-gated exports.
4. **Account and plan (M2):** optional sign-in, workspace/seat state, sync boundary, purchase/restore, data export, and deletion.
5. **Brief history and delivery (M3):** searchable confirmed briefs, repository revision, linked PR/issue, and portable export actions.

On phones the marketing site stacks; the desktop task remains install-focused. In narrow desktop windows, metadata stacks above editors, toolbar actions wrap, and the stage rail stays readable. No critical action may become icon-only.

## M1 — Local spoken brief

**Status: IN PROGRESS / NOT ACCEPTED.**

### Outcome

A new customer can install the app and complete consent → microphone capture → local transcription → structured draft → human confirmation → Markdown or Jira-text export without sending audio away.

### Scope

- Existing landing, privacy/terms, one-click demo, local manual fallback, parser, editor, confirmation gate, exports, retention, recovery, offline shell, and release pipeline.
- Packaged local English Whisper transcription with model checksum verification.
- The already-advertised recurring Pro checkout and existing-license restoration through Sociobot.
- No account, server persistence, tenant model, cloud sync, or direct tracker API.

### Accepted M1 slices

The demo/manual flow, 16 current claim tests, browser quality gates, native fixture transcription, release artifacts, Linux package smoke, and live/build parity are accepted as described in `.factory/verification-2.md`. The 2026-09-05 planner reran `npm test`, `npm run build`, `npm run build:app`, `npm run lint`, `npm run test:native`, Rust tests, strict Clippy, the URL verifier, and live Axe checks successfully after installing documented Linux prerequisites.

### Exact blockers and pending verification

1. **Blocking external dependency — billing registration:** the Sociobot billing operator must enable the product-scoped recurring offer and return URL. Current live result: checkout HTTP 404. The product worker must not request or receive provider credentials.
2. **Repository work after enablement:** change the disabled checkout presentation only after the endpoint works; replace the current `pro-price` unavailability assertion with a truthful checkout/entitlement claim; cover callback token capture, URL stripping, valid/invalid/expired/revoked behavior, and daily caching.
3. **Real paid journey:** independently verify a fresh subscription/entitlement, first unlock, restart, offline cached first paint, background reconciliation, and loss of access after a non-active verdict. Fixture-only verification is insufficient.
4. **Physical capture:** smoke-test real microphone permission, start/stop, local transcription, correction, draft, confirmation, and export on supported macOS, Windows, and Linux installs. The current WAV test is necessary but not sufficient.
5. **Package launch coverage:** launch the produced macOS and Windows packages. The Linux DEB has already passed a launch smoke.
6. **Supply chain:** make the release job fail if the downloaded Whisper model checksum differs from the pinned value already used by `npm run test:native`.
7. **Independent review:** rerun every declared claim, accessibility, 320/390 px, 200% text, offline update, privacy request capture, security headers, performance budgets, artifact checksum, and live/build parity. M1 passes only on an independent PASS report.

Package signing is not an M1 blocker while the site and release notes clearly say that packages are unsigned. It remains an operator-owned release-hardening task; no certificate or secret should be requested by a product worker.

### M1 claims and tests

Keep all 16 current entries in `.factory/claims.json` and their exact tagged tests. When checkout becomes available, revise `pro-price` rather than leaving a stale unavailability claim, then add:

| Planned claim ID | Claim only after it is true | Required test |
|---|---|---|
| `subscription-checkout` | Pro costs $12 per user each month and opens the product-scoped hosted checkout. | Browser test asserts exact URL and enabled navigation against a recorded contract response; independent verifier follows the live URL and records a successful hosted redirect. |
| `license-callback` | A returned product license is stored locally, removed from the address bar, and verified. | Fresh desktop/webview context loads callback fixture, asserts URL stripping and namespaced storage, then verifies active/inactive states. |
| `paid-recording-flow` | A licensed user can record, transcribe locally, confirm, and export. | Tauri integration test supplies deterministic media, invokes the real Rust command/model, and asserts confirmed Markdown; no mocked transcript. |
| `recording-private` | Audio and transcript stay on the device during the recording workflow. | Instrument all requests for the complete licensed flow and assert only the documented entitlement request occurs and contains no audio, transcript, or repository content. |

Run at minimum:

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

### M1 definition of done

- Every step in the stated outcome works for a fresh customer, not just seeded data or an existing token.
- The live checkout is a real Sociobot-hosted recurring offer; entitlement lifecycle behavior is independently verified without exposing credentials.
- Physical capture passes on macOS, Windows, and Linux; packages and checksums come from a successful tagged GitHub release.
- All declared claims have exactly one tagged test and pass from clean state. Published copy has no unlisted claims.
- Site/app quality, privacy, accessibility, performance, offline, recovery, and security gates stay at least at the accepted `v0.1.4` level.
- `.factory/verification-m1.md` says PASS with evidence paths. Until then, M1 and the product release remain not accepted.

## M2 — Optional accounts, safe persistence, and team entitlements

**Status: PLANNED / NOT STARTED. Entry gate: M1 PASS.**

### Outcome

A user may keep working locally without an account, or sign in to a real workspace, sync only selected confirmed briefs, and manage a paid team entitlement with enforced tenant boundaries.

### Scope and routes

- Add `/account` for sign-in/out, plan, seats, sync boundary, export, and deletion.
- Add `/briefs` for local history and explicitly synced confirmed records.
- Add product-owned axum API, SQLite on `/data`, migrations, health/readiness, rate limits, backup/restore, and content-safe logs.
- Add Entra CIAM PKCE sign-in and server authorization.
- Associate Sociobot subscription status and seats with the workspace.
- Keep `/demo` fully local and anonymous. Keep free manual drafting and export accountless.

### M2 claims and tests

| Planned claim ID | Claim only after it is true | Required test |
|---|---|---|
| `account-optional` | Local manual drafting and export work without sign-in. | Fresh offline desktop context completes manual draft → confirm → export with no auth request. |
| `tenant-isolation` | One workspace cannot read, update, export, or delete another workspace's records. | API integration creates two identities and workspaces, exercises every object endpoint with swapped IDs, and expects deny/not-found with no leaked fields. |
| `confirmed-only-sync` | Sync sends only a user-selected confirmed brief and never audio or transcript. | Network-capture test confirms drafts are rejected, request body omits audio/transcript, and demo makes no API call. |
| `team-entitlement` | Active paid seats grant team features; inactive or over-seat workspaces do not. | Contract fixtures cover active, expired, revoked, and seat-limit states; one independent live entitlement check proves wiring. |
| `account-export-delete` | A workspace owner can export and delete all server-held product data. | API/browser test compares export to seeded rows, deletes, verifies all tenant rows and sessions are gone, and confirms another tenant is unchanged. |
| `backup-restore` | Product SQLite state can be restored from a verified backup. | Disposable deployment writes records, runs online backup, restores into a clean database, and compares counts/checksums by tenant. |

### M2 definition of done

- CIAM sign-in and Sociobot subscription entitlement are real, not mocked-only; free local use remains available.
- SQLite is under the product's `/data` mount and every authenticated data path passes the cross-tenant suite.
- Audio and transcripts never enter the API. Sync is off by default and includes only explicitly selected confirmed briefs.
- Export, deletion, backup/restore, rate limits, health/readiness, redacted structured logs, and failure recovery pass.
- Demo isolation and all M1 claims remain green. Public copy and policies change only after deployment matches them.
- Independent `.factory/verification-m2.md` records PASS before M3 starts.

## M3 — Repository context and development-work delivery

**Status: PLANNED / NOT STARTED. Entry gate: M2 PASS.**

### Outcome

A confirmed brief is tied to a real local repository revision, its references are validated, and the user can place or find the brief from a PR or issue without uploading source code.

### Scope and routes

- Add a Tauri repository picker with narrowly scoped filesystem access.
- Record repository identity, revision, and whether each referenced path exists at confirmation time. Keep file contents local.
- Add `/briefs/:id` detail with revision, validation state, portable exports, and a PR/issue backlink.
- Open a prefilled GitHub new-issue page in the system browser from a confirmed brief; do not claim that an issue was created. Keep Jira support as confirmed, formatted clipboard text.
- Store a user-supplied PR/issue URL and a local “opened from linked work” event. Export the pilot outcome log only on explicit user action.
- Add local search/history across confirmed briefs. No autonomous code changes and no source indexing service.

### M3 claims and tests

| Planned claim ID | Claim only after it is true | Required test |
|---|---|---|
| `repository-validation` | A confirmed reference records whether the path exists at the selected revision. | Temporary Git fixture covers existing, missing, renamed, line-suffixed, and outside-root paths; outside-root access is denied. |
| `source-stays-local` | Repository source is never uploaded during validation or delivery. | Capture all network requests while selecting a fixture repo, confirming, syncing, and opening delivery; assert no file content appears in URLs or bodies. |
| `github-issue-draft` | A confirmed brief opens a prefilled GitHub issue draft. | Assert the generated URL, encoded title/body, confirmation guard, and external-navigation confirmation. Do not assert issue creation. |
| `work-backlink` | A confirmed brief stores and reopens its validated PR or issue link. | Browser/Tauri test rejects unsupported schemes, saves an allowed HTTPS issue/PR URL, reloads, and opens it. |
| `pilot-outcome-export` | Pilot outcomes can be exported without analytics. | Seed local capture/confirmation/open events, export, verify seven-day calculations, and assert no telemetry request. |

### M3 definition of done

- Repository access is user-selected, root-scoped, traversal-safe, and sends no source content off device.
- Only confirmed briefs can open delivery actions. GitHub is described as a prefilled draft, and Jira remains formatted text unless a later plan adds and verifies OAuth.
- Brief history, deep links, offline states, account states, and conflict states pass keyboard, screen-reader, narrow-width, and recovery tests.
- A consented pilot reports at least 60% recording-to-confirmed-brief conversion and records seven-day PR/issue use for every confirmed brief, with cohort details and failures.
- All M1/M2 claims remain green and independent `.factory/verification-m3.md` records PASS.

## External dependencies

Each dependency is listed separately so an available service cannot mask an unavailable one.

| Dependency | Phase and current state | Owner and exact contract |
|---|---|---|
| Sociobot checkout product registration | **M1 blocker; unavailable.** Product URL returns 404. | Billing operator enables slug `spoken-dev-brief`, recurring `$12/user/month`, and the product return URL. This is configuration, not a credential request to a worker. |
| Sociobot license verification endpoint | **M1 present, real valid lifecycle unproved.** Invalid-token handling and rate limiting were observed; valid responses are fixture-only. | Billing operator exposes active, expired, revoked, refunded, and wrong-product results on the product-scoped endpoint. |
| Human platform test access | **M1 verification blocker.** | Release verifier uses macOS, Windows, and Linux hosts with microphones for permission/capture tests and launches the macOS/Windows packages. |
| GitHub public release-metadata API | **M1 available.** | `api.github.com` supplies the latest asset list to the landing page; the UI retains a calm cached/fallback state. |
| GitHub Actions native runners | **M1 available.** | Product repository workflow builds arm64/x64 macOS, x64 Windows, and x64 Linux artifacts. |
| GitHub Releases asset hosting | **M1 available.** | Hosts versioned packages, `SHA256SUMS`, and `latest.json`; installers verify downloaded hashes. |
| Hugging Face Whisper model source | **M1 available, integrity repair pending.** | Build downloads `ggml-tiny.en.bin`; the release workflow must enforce the pinned SHA-256 before packaging. |
| Sociobot Entra CIAM registration | **M2 future; unavailable and unimplemented.** | Identity operator creates only this product's public client/API registration, redirect URIs, audience, and scopes. |
| Product API and durable mount | **M2 future; not provisioned.** | Factory creates only `sf-spoken-dev-brief-api`, pins one replica, and mounts its own `/data` for SQLite. |
| Sociobot workspace-seat entitlement contract | **M2 future; not implemented.** | Billing service returns product-scoped recurring subscription and seat status to the product API; Dodo remains indirect. |
| GitHub issue-draft web flow | **M3 future.** | Depends on the user's browser session and repository permission. The planned flow needs no GitHub token and does not claim issue creation. |
| User's PR/issue page | **M3 future.** | Reopening a saved HTTPS backlink depends on that external page remaining available; the product does not control it. |
| Apple signing/notarization | **Optional hardening; unavailable.** | Operator-owned Apple certificate and future workflow wiring. Unsigned macOS packages remain disclosed. |
| Windows Authenticode | **Optional hardening; unavailable.** | Operator-owned Windows certificate and future workflow wiring. Unsigned Windows packages remain disclosed. |

There is no current or planned M1–M3 dependency on messaging, HMRC access, shared PostgreSQL, or a hosted AI gateway.

## Risks and retirement experiments

| Risk | Experiment and decision gate |
|---|---|
| Billing registration or lifecycle differs from the client assumptions. | Operator enables the product; contract-test checkout, callback, active/expired/revoked states, and one fresh real entitlement before changing copy. |
| Physical microphone APIs behave differently across WebViews. | Run a five-minute consent → record → transcribe → export script on each signed/unsigned target package and retain OS/version results. |
| Tiny English Whisper is not accurate enough for technical terms. | Use a consented 20-clip engineering vocabulary set; measure word error rate and whether users can confirm a useful brief. Keep transcript correction mandatory. |
| Rule-based extraction misses owners or code paths. | Maintain a redacted fixture corpus and score decision/assumption/question/owner/path extraction. Do not call it AI; add a model only if the measured gap warrants it and privacy remains explicit. |
| Optional sync weakens the local-first promise. | Network-capture tests assert no draft, transcript, audio, or source crosses the boundary; run a five-user privacy comprehension check before enabling sync by default anywhere. |
| Tenant filters regress. | Run two-tenant denial tests against every endpoint and migration in CI; no M2 pass without full coverage. |
| LocalStorage cannot support history or migration safely. | Before M2 history work, migrate copies in a disposable profile, verify rollback/export, and choose a desktop SQLite store if measured volume exceeds safe WebView storage. |
| Unsigned packages suppress adoption. | Record install completion by opt-in pilot report. If OS warnings cause material drop-off, operator signing becomes a release gate. |
| Upstream model download changes or disappears. | Verify SHA-256 in CI before every package build and test failure on a mismatched fixture. |

## Evidence index

- Researched brief: `.factory/brief.json`
- Visual source of truth: `.factory/design.md`
- Current claims and exact commands: `.factory/claims.json`
- Demo boundary: `.factory/demo.md`
- Copy audit: `.factory/copy-audit.md`
- First independent review and repaired findings: `.factory/verification.md`
- Latest independent review and blocker: `.factory/verification-2.md`
- Current implementation: `src/main.ts`, `src/brief.ts`, `src/store.ts`, `src/license.ts`, `src-tauri/src/lib.rs`
- Release pipeline: `.github/workflows/release.yml`
- Current tests: `tests/brief.test.ts`, `tests/claims.spec.ts`, `tests/repair.spec.ts`, `tests/accessibility.spec.ts`, `tests/policy.test.ts`
