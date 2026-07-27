param(
  [string]$AwsAccountId = "609941781976",
  [string]$AwsRegion = "sa-east-1",
  [string]$EcrRepository = "katia-backend",
  [string]$EcsCluster = "katia-cluster",
  [string]$EcsService = "katia-backend-service",
  [string]$ImageTag = "latest",
  [switch]$SkipBuild,
  [switch]$RunMigrations
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$ecrHost = "$AwsAccountId.dkr.ecr.$AwsRegion.amazonaws.com"
$ecrImage = "$ecrHost/${EcrRepository}:$ImageTag"

Set-Location $root

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
aws ecs update-service `
  --cluster $EcsCluster `
  --service $EcsService `
  --force-new-deployment `
  --region $AwsRegion `
  --output json | Out-Null

Write-Host "Deploy iniciado. Aguarde a tarefa ficar Running e o target healthy."
Write-Host "Health: http://<seu-alb>/health"
