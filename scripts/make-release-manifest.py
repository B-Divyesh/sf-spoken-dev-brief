import json, os, sys
version, repo = sys.argv[1:]
files = sorted(x for x in os.listdir('.') if os.path.isfile(x) and x not in ('SHA256SUMS', 'latest.json'))
def url(name): return f"https://github.com/{repo}/releases/download/{version}/{name}"
platforms = {
    "macos-arm64": [url(x) for x in files if "aarch64" in x and x.endswith(".dmg")],
    "macos-x64": [url(x) for x in files if ("x64" in x or "x86_64" in x) and x.endswith(".dmg")],
    "windows-x64": [url(x) for x in files if x.endswith((".msi", ".exe"))],
    "linux-x64": [url(x) for x in files if x.endswith((".AppImage", ".deb"))]
}
print(json.dumps({"version": version, "platforms": platforms}, indent=2))
