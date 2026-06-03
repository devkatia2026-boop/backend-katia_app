$ErrorActionPreference = "Stop"

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$zipPath = Join-Path $here "function.zip"

if (Test-Path $zipPath) {
  Remove-Item $zipPath -Force
}

# Lambda Node 20 no console costuma usar index.mjs (ES module)
Compress-Archive -Path (Join-Path $here "index.mjs") -DestinationPath $zipPath

Write-Host "Pacote gerado: $zipPath (index.mjs)"
Write-Host "Handler na Lambda: index.handler"
Write-Host "Se usar index.js (CommonJS), compacte index.js manualmente."
