$ErrorActionPreference = 'Stop'
$BridgeProject = Split-Path -Parent $PSScriptRoot
$BridgeNode = Get-Command node.exe -ErrorAction SilentlyContinue
if (-not $BridgeNode) {
    Write-Host 'Install Node.js 22.16+ / 请安装 Node.js 22.16 或更高版本'
    Write-Host 'https://nodejs.org/en/download'
    exit 1
}
Push-Location -LiteralPath $BridgeProject
try {
    & $BridgeNode.Source (Join-Path $PSScriptRoot 'bootstrap.mjs')
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
