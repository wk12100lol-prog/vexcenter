param(
  [string]$Version = "1.0.0",
  [string]$GitHubToken = $env:GITHUB_TOKEN
)

if (-not $GitHubToken) {
  Write-Host "ERROR: Set GITHUB_TOKEN environment variable or pass -GitHubToken" -ForegroundColor Red
  exit 1
}

$repo = "wk12100lol-prog/vexcenter"
$setupPath = "dist/VexCenter Setup $Version.exe"

if (-not (Test-Path $setupPath)) {
  Write-Host "ERROR: $setupPath not found. Run 'npm run build' first." -ForegroundColor Red
  exit 1
}

# Create tag and push
git tag "v$Version" -m "Release v$Version"
git push origin "v$Version"

# Create release via API
$body = @{
  tag_name = "v$Version"
  name = "VexCenter v$Version"
  body = "VexCenter v$Version`n`nZobacz README po szczegóły."
  draft = $false
  prerelease = $false
} | ConvertTo-Json

$headers = @{
  Authorization = "Bearer $GitHubToken"
  Accept = "application/vnd.github.v3+json"
}

$release = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases" -Method Post -Headers $headers -Body $body -ContentType "application/json"
Write-Host "Release created: $($release.html_url)"

# Upload asset
$uploadUrl = $release.upload_url -replace '\{.*',''
$fileName = "VexCenter Setup $Version.exe"
$headers['Content-Type'] = 'application/octet-stream'
$fileBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $setupPath))

$asset = Invoke-RestMethod -Uri "${uploadUrl}?name=$([System.Web.HttpUtility]::UrlEncode($fileName))" -Method Post -Headers $headers -Body $fileBytes
Write-Host "Asset uploaded: $($asset.name)"
Write-Host "Done!"
