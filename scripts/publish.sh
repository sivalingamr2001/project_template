#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Building client (Vite) -> Artifact/client ..."
cd "$ROOT_DIR/client"
npm run build

echo "Publishing server (Release) -> Artifact/Server ..."
cd "$ROOT_DIR"
dotnet publish Server/Server.csproj -c Release

echo "Done."
echo "Publish output: $ROOT_DIR/Artifact/Server"
