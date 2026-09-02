# Spoken Dev Brief

Turn spoken implementation decisions into confirmed, code-linked briefs.

Spoken Dev Brief is a local-first desktop recorder for small distributed product teams. It captures selected speech with explicit consent, transcribes it with a packaged Whisper model, separates decisions from assumptions and questions, and requires human confirmation. Confirmed briefs download as Markdown or copy as Jira text.

Try the isolated sample at <https://spoken-dev-brief.sociobot.in/demo>. It uses only `demo:spoken-dev-brief:*` browser keys and never reads real data. The demo works offline after its first visit.

## What ships

- Tauri 2 desktop app for macOS, Windows, and Linux.
- Local WAV recording and Whisper transcription. Audio is not uploaded.
- Manual transcript fallback that needs no account.
- Editable owner, decisions, assumptions, open questions, and repository paths.
- Required human confirmation before a brief is final.
- Markdown download and Jira-formatted clipboard export.
- Configurable local retention and immediate deletion.
- A static download site with an isolated, one-click demo.

The free tier includes manual transcripts, review, code links, and export. Pro is $12 per user each month. It includes packaged local transcription model updates and integration updates. Billing and license verification use the Sociobot billing API.

## Develop

Requirements: Node 22+, Rust stable, and the [Tauri 2 system dependencies](https://v2.tauri.app/start/prerequisites/).

```sh
npm install
npm run dev
```

The desktop package also needs `src-tauri/resources/models/ggml-tiny.en.bin`. The release workflow downloads the published Whisper `tiny.en` model before building. To run the desktop app locally:

```sh
curl -fL https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin \
  -o src-tauri/resources/models/ggml-tiny.en.bin
npm run tauri dev
```

## Test and build

```sh
npm test
npm run build
```

`npm run build` writes the deployable static site to `dist/site/`. `npm run build:app` builds the Tauri webview UI to `dist/app/`. Claim contracts live in [.factory/claims.json](.factory/claims.json).

## Release

Push a `v*` tag or run the Release desktop app workflow. GitHub Actions builds macOS arm64 and x64 packages, Windows x64 packages, and Linux AppImage/deb packages. It attaches checksums and `latest.json` to the GitHub Release. Version 0.1 packages are unsigned.

## Privacy

The default workflow keeps recordings, transcripts, briefs, settings, and license state on the device. The app has no analytics and does not use speech or code for model training. Read the full [privacy page](https://spoken-dev-brief.sociobot.in/privacy) and [terms](https://spoken-dev-brief.sociobot.in/terms).

## License

MIT. Original product artwork was generated with the factory image model on 2 September 2026; its prompt and provenance are in [.factory/design.md](.factory/design.md).
