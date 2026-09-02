#!/bin/sh
set -eu

model="src-tauri/resources/models/ggml-tiny.en.bin"
expected="921e4cf8686fdd993dcd081a5da5b6c365bfde1162e72b08d75ac75289920b1f"
url="https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin"

actual=""
if [ -f "$model" ]; then
  actual="$(sha256sum "$model" | cut -d ' ' -f 1)"
fi

if [ "$actual" != "$expected" ]; then
  echo "Downloading the MIT-licensed Whisper tiny.en model used in desktop packages."
  temp="$(mktemp)"
  trap 'rm -f "$temp"' EXIT INT TERM
  curl -fL --retry 3 "$url" -o "$temp"
  actual="$(sha256sum "$temp" | cut -d ' ' -f 1)"
  if [ "$actual" != "$expected" ]; then
    echo "The downloaded model checksum does not match." >&2
    exit 1
  fi
  mv "$temp" "$model"
  trap - EXIT INT TERM
fi

actual="$(sha256sum "$model" | cut -d ' ' -f 1)"
if [ "$actual" != "$expected" ]; then
  echo "The packaged model checksum does not match." >&2
  exit 1
fi

cargo test --manifest-path src-tauri/Cargo.toml --lib tests::local_transcription_core -- --exact
