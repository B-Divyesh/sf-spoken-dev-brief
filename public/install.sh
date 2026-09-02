#!/bin/sh
set -eu
repo="B-Divyesh/sf-spoken-dev-brief"
api="https://api.github.com/repos/$repo/releases/latest"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT INT TERM
json="$tmp/release.json"
curl -fsSL "$api" -o "$json"
case "$(uname -s)-$(uname -m)" in
  Darwin-arm64) match='aarch64.*\.dmg$' ;;
  Darwin-*) match='x64.*\.dmg$|x86_64.*\.dmg$' ;;
  Linux-*) match='\.AppImage$' ;;
  *) echo "No installer matches this system. Open https://github.com/$repo/releases"; exit 1 ;;
esac
url="$(python3 -c 'import json,re,sys; d=json.load(open(sys.argv[1])); p=re.compile(sys.argv[2],re.I); print(next((x["browser_download_url"] for x in d["assets"] if p.search(x["name"])),""))' "$json" "$match")"
[ -n "$url" ] || { echo "Downloads are still being published."; exit 1; }
name="$(basename "$url")"
curl -fL "$url" -o "$tmp/$name"
curl -fL "$(python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); print(next(x["browser_download_url"] for x in d["assets"] if x["name"]=="SHA256SUMS"))' "$json")" -o "$tmp/SHA256SUMS"
(cd "$tmp" && grep " $name\$" SHA256SUMS | sha256sum -c -)
mkdir -p "$HOME/Downloads"
mv "$tmp/$name" "$HOME/Downloads/$name"
echo "Verified and saved $HOME/Downloads/$name"
