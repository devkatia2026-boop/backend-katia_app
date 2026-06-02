# Docker (local e AWS)

## Imagem (`Dockerfile`)

- **Build:** `docker build -t katia-backend:local .`
- **Rodar só o container:** exige Postgres acessível e variáveis de ambiente iguais às esperadas pela app (ver [.env.template](.env.template)).
- **Produção:** `NODE_ENV=production` na imagem (Express em modo prod). As migrações usam sempre o par `sequelize-cli`/`DB_*_*` conforme **`ENVIRONMENT`**: `{ local | development }` → `NODE_ENV` temporário apenas no comando `sequelize`; caso contrário → RDS (`DB_*_PROD`).
- **Migrações na subida:** defina `RUN_MIGRATIONS_ON_START=true` para executar `sequelize-cli db:migrate` antes de `node dist/main.js`. Em produção AWS com várias réplicas ou deploy blue/green prefira aplicar migrações num job/task dedicado ou no pipeline CI e mantenha `RUN_MIGRATIONS_ON_START=false` (valor padrão na imagem se não definido).

## Compose (local — só API)

```bash
docker compose up --build -d
```

- Sobe **apenas** o container da API. **Postgres não vem no compose** — usa o mesmo banco do `.env` (`DB_*_LOCAL` quando `ENVIRONMENT=local`).
- HTTP/Swagger no host: **http://localhost:8080** (ajuste `HTTP_PORT_PUBLISH` no `.env` se precisar).
- **Beekeeper / Postgres na máquina:** no `.env`, defina `DB_HOST_LOCAL=host.docker.internal` (dentro do container, `localhost` é o próprio container, não o teu PC).
- Mantenha `COGNITO_*` e demais variáveis no **`.env`** (copie de [.env.template](.env.template)).
- Migrações opcionais na subida: `RUN_MIGRATIONS_ON_START=true` no `.env`.

### Problemas comuns

- **PowerShell pede aplicativo ao correr `docker`:** há um sombreado antes do Docker Desktop (`C:\Windows\System32\docker` ou aliases). Desliga **Aliases de execução** para `docker.exe` em Definições → Apps. Depois, na raiz do backend, corre:
  `powershell -ExecutionPolicy Bypass -File scripts/windows/fix-docker-powershell.ps1`
  Abre um **novo** terminal (ou `. $PROFILE`). Se usas **PowerShell 7** (`pwsh`), volta a correr o mesmo script com `pwsh -File ...` para atualizar o perfil certo.
- **`docker` só após dot-source do perfil:** corre `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`. No Cursor mantém perfis terminal **sem** `-NoProfile` ( `%APPDATA%\Cursor\User\settings.json`). O `fix-docker-powershell.ps1` grava também em `Documents\PowerShell` além de `Documents\WindowsPowerShell`.

## Variáveis importantes por ambiente

| Contexto               | `ENVIRONMENT`                             | Credenciais e migrações (`RUN_MIGRATIONS_ON_START`)      |
|------------------------|--------------------------------------------|---------------------------------------------------------|
| Compose (só API)       | `local` (no `.env`)                        | `DB_*_LOCAL` do `.env`; host `host.docker.internal` se Postgres no PC |
| AWS / staging ou prod | não `local` nem `development`              | `DB_*_PROD` (RDS) quando as migrações correm na subida do container |

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
