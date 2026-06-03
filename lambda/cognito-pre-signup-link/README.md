# Lambda — Cognito Pre Sign-up (vínculo Google)

Vincula automaticamente login **Google** à conta **nativa** (e-mail/senha) quando o e-mail já existe no User Pool.  
Evita criar usuários duplicados `google_...`.

## O que a Lambda faz

1. Dispara em **Pre sign-up** → `PreSignUp_ExternalProvider`
2. Busca usuário nativo pelo e-mail (`ListUsers`)
3. Se existir → `AdminLinkProviderForUser` (Google → conta UUID)
4. Auto-confirma e-mail (`autoConfirmUser`, `autoVerifyEmail`)
5. Se não existir → permite cadastro Google normal (novo usuário)

---

## Passo 1 — Limpar duplicados no Cognito

Antes de ativar a Lambda:

1. Cognito → User pool → **Usuários**
2. Apague todos os usuários `google_...` duplicados
3. Mantenha só a conta nativa confirmada (UUID)

---

## Passo 2 — Criar a função Lambda

1. **Lambda** → **Criar função**
2. **Autor do zero**
3. Nome: `katia-cognito-pre-signup-link`
4. Runtime: **Node.js 20.x**
5. Arquitetura: **x86_64**
6. Criar função

### Código

O console da Lambda (Node 20) cria **`index.mjs`** (ES module). Use o arquivo certo:

| Arquivo no Lambda | Formato | Handler |
|-------------------|---------|---------|
| **`index.mjs`** (recomendado) | `import` / `export` | `index.handler` |
| **`index.js`** | `require` / `exports` | `index.handler` |

**Erro `require is not defined in ES module scope`?**  
Você colou código com `require()` dentro de `index.mjs`. Substitua pelo conteúdo de **`index.mjs`** desta pasta (não o `index.js`).

1. Abra **Code** → apague `index.mjs` ou renomeie
2. Cole o conteúdo de `backend/lambda/cognito-pre-signup-link/index.mjs`
3. **Runtime settings** → Handler: **`index.handler`**
4. **Deploy**

---

## Passo 3 — Role IAM da Lambda

1. Lambda → **Configuration** → **Permissions** → clique na **Execution role**
2. IAM → **Add permissions** → **Create inline policy** → JSON
3. Use `iam-policy.json` desta pasta, substituindo:
   - `CONTA_AWS` → ID da sua conta (12 dígitos)
   - `sa-east-1_TzhJXbizQ` → seu User Pool ID (se diferente)
4. Nome sugerido: `CognitoPreSignUpLinkPolicy`

Permissões necessárias:

- `cognito-idp:ListUsers`
- `cognito-idp:AdminGetUser`
- `cognito-idp:AdminLinkProviderForUser`
- CloudWatch Logs (para debug)

---

## Passo 4 — Associar ao Cognito User Pool

1. **Cognito** → seu User pool → **Extensions** (Extensões) ou **User pool properties** → **Lambda triggers**
2. Trigger **Pre sign-up** → selecione `katia-cognito-pre-signup-link`
3. Salvar

### Permissão de invocação (automática pelo console)

Se configurar via CLI, o Cognito precisa poder invocar a Lambda:

```bash
aws lambda add-permission \
  --function-name katia-cognito-pre-signup-link \
  --statement-id cognito-pre-signup \
  --action lambda:InvokeFunction \
  --principal cognito-idp.amazonaws.com \
  --source-arn arn:aws:cognito-idp:sa-east-1:CONTA_AWS:userpool/sa-east-1_TzhJXbizQ
```

---

## Passo 5 — Empacotar via script (opcional)

No PowerShell, na pasta desta Lambda:

```powershell
.\deploy-package.ps1
```

Gera `function.zip` para upload manual em Lambda → **Upload from** → **.zip file**.

---

## Passo 6 — Testar

1. Apague usuários `google_...` órfãos (se houver)
2. No app: **Login** → **Continuar com Google**
3. Use e-mail que já tem conta nativa (`538c7a5a...`)
4. Resultado esperado:
   - **Não** cria novo `google_...`
   - Entra direto (ou após OAuth único)
   - No Cognito, conta UUID mostra Google vinculado

### Comportamento após vincular conta existente

Quando o e-mail já existe, a Lambda **vincula** o Google e **interrompe** o OAuth da 1ª tentativa (comportamento esperado do Cognito).

O app **refaz o Google OAuth automaticamente** na 2ª tentativa e aí entra na conta original.

No CloudWatch você verá:
```text
Vínculo concluído com sucesso.
```
Seguido de erro `GoogleAccountLinkedRetry` — isso é normal na 1ª tentativa.

---

## Passo 7 — Backend local (opcional)

Com a Lambda ativa, o backend **não precisa** mais de `AdminLinkProviderForUser` / `AdminDeleteUser` no IAM local.

Mantenha no backend apenas:

- Validação de e-mail duplicado no Postgres (cadastro)
- Criação de perfil aluna após OAuth

Pode remover do `backend/.env`:

```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

(se só eram usados para vínculo Cognito)

---

## Fluxo completo após Lambda

```text
Usuário → Google OAuth → Cognito Pre Sign-up (Lambda)
                              ↓
                    E-mail já existe?
                    /              \
                  Sim               Não
                   ↓                 ↓
            Vincula Google      Novo usuário
            à conta UUID        Google
                   ↓                 ↓
            Tokens do UUID    Backend cria perfil
            Backend getMe OK  no Postgres (signup)
```

---

## Problemas comuns

| Sintoma | Solução |
|---------|---------|
| Ainda cria `google_...` | Lambda não associada ao trigger Pre sign-up |
| Erro na Lambda | Ver CloudWatch; conferir IAM e User Pool ID |
| "E-mail já cadastrado" no app | Usou **Cadastrar com Google**; use **Login** |
| Link falha "already linked" | Normal se já vinculado; apague `google_...` órfão |
| `invalid_grant` / authorization grant | Ver seção abaixo |
| Loop infinito “só vincula” | Atualize `index.mjs`; confira IAM `AdminGetUser`; apague `google_...` órfãos |

### Erro `invalid_grant` no login Google

Causas frequentes:

1. **Expo Go com redirect errado** — no log deve aparecer `plataforma=expo-go` e `exp://.../--/oauth/callback`, não `kitraining://`. Reinicie o Expo após atualizar o app.
2. **1ª tentativa após vínculo na Lambda** — o code expira; clique em **Continuar com Google** de novo (web) ou deixe o app tentar automaticamente (mobile).
3. **Permissões do App Client no Cognito** — em **App integration → App client → Attribute read and write permissions**, marque leitura de **`email`** e **`email_verified`** (obrigatório quando o scope `email` é pedido).
4. **Callback URLs** — confira no App Client se estão cadastrados exatamente:
   - `http://localhost:8081/oauth/callback` (web)
   - `exp://192.168.100.78:8081/--/oauth/callback` (Expo Go — use seu IP)
   - `kitraining://oauth/callback` (build nativo)

### Loop “só vincula, nunca entra”

A Lambda antiga **sempre lançava erro** após o vínculo — inclusive quando o Google já estava vinculado — e o app ficava em retry infinito.

Versão atual:

- **1ª tentativa** (e-mail nativo existe, Google ainda não vinculado): vincula → pede nova autenticação.
- **2ª tentativa em diante** (Google já vinculado): **conclui o login** sem bloquear.

Se persistir: apague usuários `google_...` órfãos no Cognito e adicione `AdminGetUser` na IAM da Lambda.

---

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `index.js` | Código da Lambda |
| `iam-policy.json` | Política IAM de exemplo |
| `deploy-package.ps1` | Gera ZIP para upload |
