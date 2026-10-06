# Encerramento restante em sa-east-1 (requer IAM com RDS + ECR).
# Ja feito com user Lucas: ECS desired 0, servico removido, cluster INACTIVE, ALB e target group apagados, log group /ecs/katia-backend removido.
# DNS api.kitraining.com.br aponta para us-east-1 — nao ha rollback via ALB SP.

param(
  [string]$Region = "sa-east-1",
  [string]$DbInstanceId = "katia-backend-db",
  [string]$SnapshotId = "katia-backend-db-sp-final-20261003",
  [string]$EcrRepository = "katia-backend",
  [switch]$SkipSnapshot,
  [switch]$UseFinalSnapshotOnDelete
)

$ErrorActionPreference = "Stop"

if (-not $SkipSnapshot) {
  Write-Host "Snapshot manual: $SnapshotId"
  aws rds create-db-snapshot `
    --db-instance-identifier $DbInstanceId `
    --db-snapshot-identifier $SnapshotId `
    --region $Region `
    --output json | Out-Null

  Write-Host "Aguardando snapshot available..."
  aws rds wait db-snapshot-available `
    --db-snapshot-identifier $SnapshotId `
    --region $Region
}

if ($UseFinalSnapshotOnDelete) {
  Write-Host "Apagando RDS com snapshot final automatico..."
  aws rds delete-db-instance `
    --db-instance-identifier $DbInstanceId `
    --final-db-snapshot-identifier "${DbInstanceId}-final-on-delete" `
    --region $Region `
    --output json | Out-Null
} else {
  Write-Host "Apagando RDS (sem snapshot final — use snapshot manual acima)..."
  aws rds delete-db-instance `
    --db-instance-identifier $DbInstanceId `
    --skip-final-snapshot `
    --region $Region `
    --output json | Out-Null
}

Write-Host "Aguardando RDS sumir..."
aws rds wait db-instance-deleted `
  --db-instance-identifier $DbInstanceId `
  --region $Region

Write-Host "Apagando repositorio ECR SP (opcional, storage)..."
aws ecr delete-repository `
  --repository-name $EcrRepository `
  --force `
  --region $Region `
  --output json | Out-Null

Write-Host "Concluido. Manter: Cognito, S3, Lambda pre-signup em sa-east-1."
