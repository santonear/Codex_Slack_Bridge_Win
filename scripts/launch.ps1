param([switch]$Background)
$ErrorActionPreference = 'Stop'
$BridgeProject = Split-Path -Parent $PSScriptRoot
$BridgeNode = Get-Command node.exe -ErrorAction SilentlyContinue
if (-not $BridgeNode) {
    Write-Host 'Install Node.js 22.16+ / Please install Node.js'
    Write-Host 'https://nodejs.org/en/download'
    exit 1
}
Push-Location -LiteralPath $BridgeProject
try {
    if (-not $Background) {
        & $BridgeNode.Source (Join-Path $PSScriptRoot 'bootstrap.mjs') --prepare-only
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        $BridgeArguments = '-NoProfile -ExecutionPolicy Bypass -File "' + $PSCommandPath + '" -Background'
        Start-Process -FilePath 'powershell.exe' -ArgumentList $BridgeArguments -WorkingDirectory $BridgeProject -WindowStyle Hidden
        exit 0
    }
    & $BridgeNode.Source (Join-Path $PSScriptRoot 'bootstrap.mjs')
    if ($LASTEXITCODE -ne 0) {
        $BridgeDialog = New-Object -ComObject WScript.Shell
        $null = $BridgeDialog.Popup('Bridge could not start. Run scripts\launch.ps1 -Background in PowerShell to view the error.', 0, 'Codex Slack Bridge', 16)
    }
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
