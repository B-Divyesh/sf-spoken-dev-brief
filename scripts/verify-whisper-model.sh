#!/bin/sh
set -eu

model="${MODEL_PATH:-src-tauri/resources/models/ggml-tiny.en.bin}"
expected="921e4cf8686fdd993dcd081a5da5b6c365bfde1162e72b08d75ac75289920b1f"

if [ ! -f "$model" ]; then
  echo "The packaged local transcription model is missing: $model" >&2
  exit 1
fi

actual="$(sha256sum "$model" | cut -d ' ' -f 1)"
if [ "$actual" != "$expected" ]; then
  echo "The packaged local transcription model checksum does not match." >&2
  exit 1
fi
