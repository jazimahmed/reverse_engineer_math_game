# Seeds every unresolved artifact from a gradle log into the local Gradle cache.
# Usage: powershell -File tools\seed_missing.ps1 -LogPath <gradle log>
param([Parameter(Mandatory=$true)][string]$LogPath)

$ErrorActionPreference = "Continue"
$cache = "$env:USERPROFILE\.gradle\caches\modules-2\files-2.1"
$lines = Get-Content $LogPath -Encoding UTF8

# Match: "Could not find/download <filename> (group:module:version)." or "... <filename> (group:module:version)."
$pattern = "Could not (?:find|download|resolve) \S*?([\w\-\.]+\.(?:jar|aar)) \(([a-zA-Z0-9_\.]+):([a-zA-Z0-9_\-\.]+):([a-zA-Z0-9_\-\.]+)\)"
$missing = @()
foreach ($l in $lines) {
  if ($l -match $pattern) {
    $file = $Matches[1]; $g = $Matches[2]; $m = $Matches[3]; $v = $Matches[4]
    $key = "$g`:$m`:$v`:$file"
    if (-not ($missing | Where-Object { $_.Key -eq $key })) {
      $missing += [pscustomobject]@{ Key = $key; File = $file; Group = $g; Module = $m; Version = $v }
    }
  }
}
"### parsed $($missing.Count) missing artifacts from $LogPath"
if ($missing.Count -eq 0) { "### NOTHING MISSING"; exit 0 }

$ok = 0; $fail = @()
foreach ($a in $missing) {
  $gpath = $a.Group -replace "\.", "/"
  # try repo.maven first (curl resumable); the aar name may be a variant like foo-release.aar
  $candidates = @(
    "https://repo.maven.apache.org/maven2/$gpath/$($a.Module)/$($a.Version)/$($a.File)",
    "https://dl.google.com/dl/android/maven2/$gpath/$($a.Module)/$($a.Version)/$($a.File)",
    "https://maven.aliyun.com/repository/public/$gpath/$($a.Module)/$($a.Version)/$($a.File)",
    "https://maven.aliyun.com/repository/google/$gpath/$($a.Module)/$($a.Version)/$($a.File)"
  )
  $dst = "$env:TEMP\batch_$($a.File)"
  Remove-Item $dst -Force -ErrorAction SilentlyContinue
  $done = $false
  foreach ($u in $candidates) {
    "### trying $u"
    curl.exe -sL --retry 30 --retry-delay 6 --retry-all-errors -C - --max-time 1200 -o $dst $u
    if ((Test-Path $dst) -and (Get-Item $dst -ErrorAction SilentlyContinue).Length -gt 0) {
      # sanity: must be a zip/jar (PK header) or text (pom-shape)
      $bytes = [System.IO.File]::ReadAllBytes($dst)[0..1]
      if ($bytes[0] -eq 0x50 -and $bytes[1] -eq 0x4B) { $done = $true; break }
      if ($u -notmatch "\.(jar|aar)$") { $done = $true; break }
    }
  }
  if (-not $done) { $fail += $a.Key; "### FAILED: $($a.Key)"; continue }
  $size = (Get-Item $dst).Length
  $sha1 = (Get-FileHash $dst -Algorithm SHA1).Hash.ToLower()
  # verify against official sidecar (best-effort)
  curl.exe -sL --retry 10 --retry-delay 5 --retry-all-errors --max-time 60 -o "$env:TEMP\batch.sha1check" "$($candidates[0]).sha1"
  $expected = (Get-Content "$env:TEMP\batch.sha1check" -Raw -ErrorAction SilentlyContinue).Split(" ")[0].Trim().ToLower()
  $verified = if ($expected -and $expected -eq $sha1) { "SIDEAR-OK" } elseif ($expected) { "SIDEAR-MISMATCH(expected=$expected)" } else { "NO-SIDECAR" }
  $dir = "$cache\$($a.Group)\$($a.Module)\$($a.Version)\$sha1"
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  Copy-Item $dst "$dir\$($a.File)" -Force
  "### SEEDED $($a.Key) size=$size $verified"
  $ok++
}
"### DONE ok=$ok failed=$($fail.Count)"
if ($fail) { $fail | ForEach-Object { "FAILED: $_" } }
