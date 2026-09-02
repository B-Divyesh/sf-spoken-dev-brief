# Local model

The release workflow downloads `ggml-tiny.en.bin` from the `ggerganov/whisper.cpp` model repository before packaging. The model is derived from OpenAI Whisper, released under MIT. It is intentionally excluded from Git because it is about 75 MB.
