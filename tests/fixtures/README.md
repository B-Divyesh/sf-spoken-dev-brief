# Native transcription fixture

`jfk.wav` is the public Whisper.cpp speech fixture from
<https://github.com/ggerganov/whisper.cpp/blob/master/samples/jfk.wav>.
Whisper.cpp is MIT-licensed. Its fixed SHA-256 is
`59dfb9a4acb36fe2a2affc14bacbee2920ff435cb13cc314a08c13f66ba7860e`.

The native claim test decodes this WAV and transcribes it with the exact
`ggml-tiny.en.bin` model packaged by the release workflow.
