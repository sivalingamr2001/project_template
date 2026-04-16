$ErrorActionPreference = "Stop"

$RootDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

Write-Host "Building client (Vite) -> Artifact/client ..."
Push-Location (Join-Path $RootDir "client")
npm run build
Pop-Location

Write-Host "Publishing server (Release) -> Artifact/Server ..."
dotnet publish (Join-Path $RootDir "Server/Server.csproj") -c Release

Write-Host "Done."
Write-Host ("Publish output: " + (Join-Path $RootDir "Artifact/Server"))
