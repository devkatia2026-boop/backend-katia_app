function Read-DotEnvFile {
  param([Parameter(Mandatory = $true)][string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Arquivo .env nao encontrado: $Path"
  }

  $map = @{}
  Get-Content -LiteralPath $Path -Encoding UTF8 | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) { return }
    $eq = $line.IndexOf('=')
    if ($eq -lt 1) { return }
    $name = $line.Substring(0, $eq).Trim()
    $value = $line.Substring($eq + 1)
    if ($value.Length -ge 2) {
      if ($value.StartsWith('"') -and $value.EndsWith('"')) {
        $value = $value.Substring(1, $value.Length - 2)
      } elseif ($value.StartsWith("'") -and $value.EndsWith("'")) {
        $value = $value.Substring(1, $value.Length - 2)
      }
    }
    $map[$name] = $value
  }
  return $map
}

function Get-EcsEnvSyncKeys {
  param([Parameter(Mandatory = $true)][string]$KeysFile)

  if (-not (Test-Path -LiteralPath $KeysFile)) {
    throw "Lista de chaves ECS nao encontrada: $KeysFile"
  }

  Get-Content -LiteralPath $KeysFile -Encoding UTF8 |
    ForEach-Object { $_.Trim() } |
    Where-Object { $_ -and -not $_.StartsWith('#') }
}

function Sync-EcsTaskEnvFromDotEnv {
  param(
    [Parameter(Mandatory = $true)][string]$DotEnvPath,
    [Parameter(Mandatory = $true)][string]$KeysFile,
    [Parameter(Mandatory = $true)][string]$Cluster,
    [Parameter(Mandatory = $true)][string]$Service,
    [Parameter(Mandatory = $true)][string]$Region,
    [int]$ContainerIndex = 0
  )

  $syncKeys = @(Get-EcsEnvSyncKeys -KeysFile $KeysFile)
  if ($syncKeys.Count -eq 0) {
    Write-Host "Nenhuma chave em $KeysFile; pulando sync de env."
    return $null
  }

  $dotEnv = Read-DotEnvFile -Path $DotEnvPath
  $keysFromFile = @($dotEnv.Keys | Where-Object { $_ -in $syncKeys })
  if ($keysFromFile.Count -eq 0) {
    Write-Host "Nenhuma chave ECS presente no .env; pulando sync."
    return $null
  }

  Write-Host "Sync ECS env: $($keysFromFile.Count) chave(s) do .env -> task definition"

  $serviceJson = aws ecs describe-services `
    --cluster $Cluster `
    --services $Service `
    --region $Region `
    --query 'services[0].taskDefinition' `
    --output text

  if (-not $serviceJson -or $serviceJson -eq 'None') {
    throw "Servico ECS nao encontrado: $Cluster / $Service"
  }

  $taskDefRaw = aws ecs describe-task-definition `
    --task-definition $serviceJson `
    --region $Region `
    --query 'taskDefinition' `
    --output json

  $td = $taskDefRaw | ConvertFrom-Json

  $stripProps = @(
    'taskDefinitionArn', 'revision', 'status', 'requiresAttributes', 'compatibilities',
    'registeredAt', 'registeredBy', 'deregisteredAt'
  )
  foreach ($prop in $stripProps) {
    if ($td.PSObject.Properties.Name -contains $prop) {
      $td.PSObject.Properties.Remove($prop)
    }
  }

  if ($td.containerDefinitions.Count -le $ContainerIndex) {
    throw "Task definition sem container index $ContainerIndex"
  }

  $container = $td.containerDefinitions[$ContainerIndex]
  $merged = @{}
  if ($null -ne $container.environment) {
    foreach ($entry in $container.environment) {
      $merged[$entry.name] = [string]$entry.value
    }
  }

  foreach ($key in $syncKeys) {
    if ($dotEnv.ContainsKey($key)) {
      $merged[$key] = [string]$dotEnv[$key]
    }
  }

  $merged['PORT'] = '3000'

  $newEnvironment = @(
    foreach ($name in ($merged.Keys | Sort-Object)) {
      @{ name = $name; value = $merged[$name] }
    }
  )

  $container.environment = $newEnvironment
  $td.containerDefinitions[$ContainerIndex] = $container

  $pendingName = ".ecs-register-task-def.pending.json"
  $tempFile = Join-Path $PSScriptRoot $pendingName
  $json = $td | ConvertTo-Json -Depth 50 -Compress
  [System.IO.File]::WriteAllText($tempFile, $json, [System.Text.UTF8Encoding]::new($false))

  $forward = (Resolve-Path -LiteralPath $tempFile).Path -replace '\\', '/'
  $cliInput = "file://$forward"

  try {
    $newArn = aws ecs register-task-definition `
      --cli-input-json $cliInput `
      --region $Region `
      --query 'taskDefinition.taskDefinitionArn' `
      --output text
  } finally {
    Remove-Item -LiteralPath $tempFile -ErrorAction SilentlyContinue
  }

  if (-not $newArn) {
    throw "Falha ao registrar nova revisao da task definition"
  }

  Write-Host "Nova task definition: $newArn"
  return $newArn
}
