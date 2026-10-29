param(
  [string]$AwsAccountId = "609941781976",
  [string]$AwsRegion = "us-east-1",
  [string]$EcrRepository = "katia-backend",
  [string]$EcsCluster = "katia-cluster",
  [string]$EcsService = "katia-backend-service",
  [string]$ImageTag = "latest",
  [string]$DotEnvPath = "",
  [switch]$SkipBuild,
  [switch]$SkipEnvSync,
  [switch]$RunMigrations
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$ecrHost = "$AwsAccountId.dkr.ecr.$AwsRegion.amazonaws.com"
$ecrImage = "$ecrHost/${EcrRepository}:$ImageTag"
$envKeysFile = Join-Path $PSScriptRoot "ecs-env-sync-keys.txt"
if (-not $DotEnvPath) {
  $DotEnvPath = Join-Path $root ".env"
}

Set-Location $root

. (Join-Path $PSScriptRoot "Sync-EcsTaskEnvFromDotEnv.ps1")

$newTaskDefinitionArn = $null
if (-not $SkipEnvSync) {
  $newTaskDefinitionArn = Sync-EcsTaskEnvFromDotEnv `
    -DotEnvPath $DotEnvPath `
    -KeysFile $envKeysFile `
    -Cluster $EcsCluster `
    -Service $EcsService `
    -Region $AwsRegion
}

if ($RunMigrations) {
  Write-Host "Rodando migracoes (production)..."
  $env:NODE_ENV = "production"
  npm run db:migrate --silent
}

if (-not $SkipBuild) {
  Write-Host "Build Docker: katia-backend:$ImageTag"
  docker build -t "katia-backend:$ImageTag" .
}

Write-Host "Login ECR: $ecrHost"
aws ecr get-login-password --region $AwsRegion |
  docker login --username AWS --password-stdin $ecrHost

Write-Host "Push: $ecrImage"
docker tag "katia-backend:$ImageTag" $ecrImage
docker push $ecrImage

Write-Host "ECS force new deployment: $EcsCluster / $EcsService"
$updateArgs = @(
  "ecs", "update-service",
  "--cluster", $EcsCluster,
  "--service", $EcsService,
  "--health-check-grace-period-seconds", "120",
  "--force-new-deployment",
  "--region", $AwsRegion,
  "--output", "json"
)
if ($newTaskDefinitionArn) {
  $updateArgs += @("--task-definition", $newTaskDefinitionArn)
}
& aws @updateArgs | Out-Null

Write-Host "Deploy iniciado. Aguarde a tarefa ficar Running e o target healthy."
Write-Host "Health: http://<seu-alb>/health"
