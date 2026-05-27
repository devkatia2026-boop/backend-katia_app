# Docker (local e AWS)

## Imagem (`Dockerfile`)

- **Build:** `docker build -t katia-backend:local .`
- **Rodar só o container:** exige Postgres acessível e variáveis de ambiente iguais às esperadas pela app (ver [.env.template](.env.template)).
- **Produção:** `NODE_ENV=production` na imagem (Express em modo prod). As migrações usam sempre o par `sequelize-cli`/`DB_*_*` conforme **`ENVIRONMENT`**: `{ local | development }` → `NODE_ENV` temporário apenas no comando `sequelize`; caso contrário → RDS (`DB_*_PROD`).
- **Migrações na subida:** defina `RUN_MIGRATIONS_ON_START=true` para executar `sequelize-cli db:migrate` antes de `node dist/main.js`. Em produção AWS com várias réplicas ou deploy blue/green prefira aplicar migrações num job/task dedicado ou no pipeline CI e mantenha `RUN_MIGRATIONS_ON_START=false` (valor padrão na imagem se não definido).

## Compose (local)

```bash
docker compose up --build -d
```

- HTTP/Swagger na máquina host: **http://localhost:8080** (ajuste `HTTP_PORT_PUBLISH` no `.env` se precisar).
- Postgres também em **localhost:`POSTGRES_PORT_PUBLISH`** (padrão 5432).
- Mantenha `COGNITO_*` válidos num ficheiro **`.env`** na raiz do backend (copie de [.env.template](.env.template)).

### Problemas comuns

- **PowerShell pede aplicativo ao correr `docker`:** há um sombreado antes do Docker Desktop (`C:\Windows\System32\docker` ou aliases). Desliga **Aliases de execução** para `docker.exe` em Definições → Apps. Depois, na raiz do backend, corre:
  `powershell -ExecutionPolicy Bypass -File scripts/windows/fix-docker-powershell.ps1`
  Abre um **novo** terminal (ou `. $PROFILE`). Se usas **PowerShell 7** (`pwsh`), volta a correr o mesmo script com `pwsh -File ...` para atualizar o perfil certo.
- **`docker` só após dot-source do perfil:** corre `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`. No Cursor mantém perfis terminal **sem** `-NoProfile` ( `%APPDATA%\Cursor\User\settings.json`). O `fix-docker-powershell.ps1` grava também em `Documents\PowerShell` além de `Documents\WindowsPowerShell`.

## Variáveis importantes por ambiente

| Contexto               | `ENVIRONMENT`                             | Credenciais e migrações (`RUN_MIGRATIONS_ON_START`)      |
|------------------------|--------------------------------------------|---------------------------------------------------------|
| Compose neste repo     | `local`                                    | App e migrações: `DB_*_LOCAL` contra o serviço `db`     |
| AWS / staging ou prod | não `local` nem `development`              | App e migrações: `DB_*_PROD` (RDS) quando as migrações correm na subida do container |

Runtime da app (`getDatabaseConfig`) usa apenas **`ENVIRONMENT`**, não o `NODE_ENV` global.


## Push para AWS

1. Crear ou usar repositório (ex.: **Amazon ECR**).
2. Autenticação CLI e tags: por exemplo  
   `docker tag katia-backend:local YOUR_ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/katia-backend:latest`  
   `docker push ...`
3. **ECS/Fargate** (ou parecido): defina porta do container **3000**, comando/entrypoint padrão da imagem, variáveis/segredos para Cognito e `DB_*_PROD`, `ENVIRONMENT=production` – ou o valor não `local|development` que utilizar nos ambientes staging/prod conforme [.env.template](.env.template).
4. WebSocket **`/ws/conversations`** com **Application Load Balancer**: ative suporte HTTP/1.1 com upgrade ou use recurso recomendado para WebSockets (sticky sessions/target group adequado conforme AWS).

## Scripts npm

- `npm run build` — gera `dist/` (TypeScript).
- `npm run start:prod` — igual ao processo dentro do container (`node dist/main.js`).
