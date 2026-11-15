$ErrorActionPreference = "Stop"

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$zipPath = Join-Path $here "function.zip"
$functionName = if ($env:LAMBDA_NAME) { $env:LAMBDA_NAME } else { "katia-cognito-pre-signup-link" }
$region = if ($env:AWS_REGION) { $env:AWS_REGION } else { "sa-east-1" }

& (Join-Path $here "deploy-package.ps1")

Write-Host "Enviando para Lambda $functionName ($region)..."
$zipForward = $zipPath -replace '\\', '/'
aws lambda update-function-code `
  --function-name $functionName `
  --region $region `
  --zip-file "fileb://$zipForward" `
  --output json

Write-Host "Deploy concluído. Confira handler: index.handler (index.mjs)"