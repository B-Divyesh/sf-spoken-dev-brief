$ErrorActionPreference = "Stop"
$repo = "B-Divyesh/sf-spoken-dev-brief"
$release = Invoke-RestMethod "https://api.github.com/repos/$repo/releases/latest"
$asset = $release.assets | Where-Object { $_.name -match '\.(msi|exe)$' } | Select-Object -First 1
if (-not $asset) { throw "Downloads are still being published." }
$sumAsset = $release.assets | Where-Object { $_.name -eq 'SHA256SUMS' } | Select-Object -First 1
$target = Join-Path $env:USERPROFILE "Downloads\$($asset.name)"
Invoke-WebRequest $asset.browser_download_url -OutFile $target
$sums = (Invoke-WebRequest $sumAsset.browser_download_url).Content
$expected = (($sums -split "`n") | Where-Object { $_ -match [regex]::Escape($asset.name) } | Select-Object -First 1) -split '\s+' | Select-Object -First 1
$actual = (Get-FileHash $target -Algorithm SHA256).Hash.ToLower()
if ($actual -ne $expected.ToLower()) { Remove-Item $target; throw "Checksum verification failed." }
Write-Host "Verified and saved $target"
