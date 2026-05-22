/**
 * Documento OpenAPI 3.0 para a documentação Swagger da API.
 * swagger-ui-express aceita um objeto compatível com OpenAPI 3.0.
 */
export const swaggerDocument = {
  openapi: '3.0.0',
  tags: [
    {
      name: 'Conversas',
      description:
        '**Histórico (REST):** `GET /conversations/messages`. Aluna só vê a própria thread; treinadora envia obrigatoriamente `studentId`. **Ao vivo:** WebSocket upgrade em `/ws/conversations?token=<access JWT Cognito>`. Fluxo cliente: ligar WebSocket → evento servidor `connected` → treinadora envia `{ "type":"join", "studentId":"<uuid aluna>" }` e recebe `joined` → qualquer lado envia `{ "type":"message", "text":"..." }`; broadcast para quem está na sala: `{ "type":"conversation:message", "payload":{...} }`. Aluna já entra na sala da própria conversa ao conectar.',
    },
  ],
  info: {
    title: 'API Backend Reta AI',
    version: '1.0.0',
    description:
      'Documentação da API de autenticação e recursos do backend. Chat treinadora–aluna com WebSocket está documentado na tag **Conversas**.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token do Cognito (retornado no login; token_use=access).',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        description: 'Verifica se a API está em execução.',
        responses: {
          '200': {
            description: 'API está funcionando',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Registrar usuário',
        description:
          'Cria o usuário no Cognito (atributo custom:typeUser) e persiste em trainers ou students conforme o tipo. É necessário confirmar o cadastro por e-mail.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name', 'typeUser'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'usuario@email.com' },
                  password: { type: 'string', example: 'Senha123!' },
                  name: { type: 'string', example: 'Nome do Usuário' },
                  typeUser: { type: 'string', enum: ['student', 'trainer'], example: 'student' },
                  trainer_id: {
                    type: 'string',
                    format: 'uuid',
                    description:
                      'Obrigatório quando typeUser é student (UUID do treinador). Omitir para trainer.',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Usuário criado. Verifique o e-mail para confirmar o cadastro.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    userSub: { type: 'string' },
                    typeUser: { type: 'string', enum: ['student', 'trainer'] },
                  },
                },
              },
            },
          },
          '400': {
            description:
              'Campo(s) ausente(s) (veja `missing`), typeUser inválido ou senha fora do padrão',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    missing: {
                      type: 'array',
                      items: { type: 'string', example: 'email' },
                    },
                    field: { type: 'string', description: 'Campo com valor inválido (ex.: typeUser)' },
                  },
                },
              },
            },
          },
          '404': { description: 'Treinador não encontrado (student)' },
          '409': { description: 'E-mail já cadastrado no Cognito ou conflito no banco' },
        },
      },
    },
    '/auth/confirm': {
      post: {
        summary: 'Confirmar cadastro',
        description: 'Confirma o cadastro usando o código enviado por e-mail.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'code'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  code: { type: 'string', description: 'Código de 6 dígitos recebido por e-mail' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Cadastro confirmado com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': { description: 'Código inválido ou expirado' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login',
        description: 'Autentica o usuário com e-mail e senha.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login realizado com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    idToken: { type: 'string' },
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                    expiresIn: { type: 'number' },
                  },
                },
              },
            },
          },
          '400': { description: 'Dados inválidos' },
          '401': { description: 'Credenciais inválidas' },
          '403': { description: 'Usuário não confirmado' },
          '404': { description: 'Usuário não encontrado' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        summary: 'Renovar sessão (refresh token)',
        description:
          'Troca o refresh token por novos id/access tokens (AuthFlow REFRESH_TOKEN_AUTH no Cognito). O campo expiresIn vem em segundos.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: {
                    type: 'string',
                    description: 'Refresh token retornado no login',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Novos tokens emitidos.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    idToken: { type: 'string' },
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                    expiresIn: {
                      type: 'number',
                      description: 'Validade dos novos tokens em segundos (ex.: 3600 = 1 hora)',
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'refreshToken ausente ou inválido' },
          '401': { description: 'Refresh token expirado ou revogado' },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Dados do usuário autenticado',
        description:
          'Retorna o perfil (trainer ou student) conforme o `sub` do access token. Exige Authorization: Bearer com access token do Cognito.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Perfil encontrado.',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    {
                      type: 'object',
                      required: ['role', 'profile'],
                      properties: {
                        role: { type: 'string', enum: ['trainer'] },
                        profile: {
                          type: 'object',
                          description: 'Campos da tabela trainers (sem refresh_token nem expo_push_token)',
                        },
                      },
                    },
                    {
                      type: 'object',
                      required: ['role', 'profile'],
                      properties: {
                        role: { type: 'string', enum: ['student'] },
                        profile: {
                          type: 'object',
                          description: 'Campos da tabela students (sem refresh_token nem expo_push_token)',
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          '401': { description: 'Token ausente ou inválido' },
          '404': { description: 'Usuário autenticado mas sem registro local' },
        },
      },
      patch: {
        summary: 'Atualizar perfil autenticado',
        description:
          'Atualiza parcialmente o perfil. Para campos de identidade (name/email/phone) o backend sincroniza também com o Cognito via access token; os demais campos permanecem apenas no banco. Envie apenas os campos a alterar. `photo_perfil` é string (URL ou base64) ou null para limpar; treinador e aluna. Campos `birth`, `cpf`, `type_plan`, `height` e `weight` são exclusivos de aluno. O token de push Expo não é retornado no GET /auth/me.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  name: { type: 'string', description: 'Nome completo (mapeado para full_name)' },
                  photo_perfil: {
                    type: 'string',
                    nullable: true,
                    description: 'Foto de perfil (URL ou base64); null remove',
                  },
                  phone: { type: 'string', nullable: true, description: 'Telefone ou null para limpar' },
                  email: { type: 'string', format: 'email' },
                  expo_push_token: {
                    type: 'string',
                    nullable: true,
                    description: 'Token Expo Push para notificações; null remove',
                  },
                  birth: {
                    type: 'string',
                    nullable: true,
                    description: 'Data (YYYY-MM-DD); apenas student',
                  },
                  cpf: { type: 'string', nullable: true, description: 'Apenas student' },
                  type_plan: { type: 'string', nullable: true, description: 'Apenas student' },
                  height: { type: 'number', nullable: true, description: 'Apenas student' },
                  weight: { type: 'number', nullable: true, description: 'Apenas student' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Perfil atualizado; corpo igual ao GET /auth/me.',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    {
                      type: 'object',
                      required: ['role', 'profile'],
                      properties: {
                        role: { type: 'string', enum: ['trainer'] },
                        profile: { type: 'object' },
                      },
                    },
                    {
                      type: 'object',
                      required: ['role', 'profile'],
                      properties: {
                        role: { type: 'string', enum: ['student'] },
                        profile: { type: 'object' },
                      },
                    },
                  ],
                },
              },
            },
          },
          '400': { description: 'Corpo vazio, campos inválidos ou campos de aluno em perfil de treinador' },
          '401': { description: 'Token ausente ou inválido' },
          '404': { description: 'Perfil não encontrado' },
          '409': { description: 'Conflito no banco (ex.: e-mail duplicado)' },
        },
      },
    },
    '/student/anamnesis': {
      post: {
        summary: 'Criar anamnese da aluna',
        description:
          'Cria a anamnese para a aluna autenticada. Retorna 409 se já existir uma anamnese cadastrada para a aluna.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  main_objective: { type: 'string', nullable: true },
                  place_training: { type: 'string', nullable: true },
                  days_for_week: { type: 'string', nullable: true },
                  level_experience: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Anamnese criada' },
          '400': { description: 'Corpo inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Usuário não é aluna' },
          '409': { description: 'Anamnese já existe' },
        },
      },
      patch: {
        summary: 'Atualizar anamnese da aluna',
        description:
          'Atualiza a última anamnese da aluna autenticada (PATCH parcial). Retorna 404 se não existir anamnese.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  main_objective: { type: 'string', nullable: true },
                  place_training: { type: 'string', nullable: true },
                  days_for_week: { type: 'string', nullable: true },
                  level_experience: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Anamnese atualizada' },
          '400': { description: 'Corpo inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Usuário não é aluna' },
          '404': { description: 'Anamnese não encontrada' },
        },
      },
    },
    '/student/physicals': {
      get: {
        summary: 'Listar registros físicos da aluna',
        description: 'Lista os registros da tabela `physicals` da aluna autenticada (mais recentes primeiro).',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Lista em `items`',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Usuário não é aluna' },
        },
      },
      post: {
        summary: 'Criar registro físico',
        description: 'Cria um registro em `physicals`. Envie ao menos um entre `weight`, `height` e `objective`.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  weight: { type: 'number', nullable: true },
                  height: { type: 'number', nullable: true },
                  objective: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Registro criado' },
          '400': { description: 'Corpo inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Usuário não é aluna' },
        },
      },
    },
    '/student/evolutions': {
      get: {
        summary: 'Listar evoluções (imagens antes/depois)',
        description:
          'Lista as evoluções da aluna autenticada (`evolutions`): mais recentes primeiro. Imagens são strings (URL ou base64) em `original_photo` e `current_photo`.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Lista em `items`',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Usuário não é aluna' },
        },
      },
      post: {
        summary: 'Registrar evolução (imagens)',
        description:
          'Cria uma evolução. Envie ao menos uma imagem em `original_photo` ou `current_photo` (string; URL ou dados base64 conforme política do app).',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  original_photo: { type: 'string', nullable: true },
                  current_photo: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Evolução criada' },
          '400': { description: 'Corpo inválido (nenhuma imagem válida)' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Usuário não é aluna' },
        },
      },
    },
    '/student/evolutions/{evolutionId}': {
      get: {
        summary: 'Obter uma evolução',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'evolutionId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': { description: 'Evolução encontrada' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Usuário não é aluna' },
          '404': { description: 'Não encontrada' },
        },
      },
      patch: {
        summary: 'Atualizar evolução',
        description:
          'PATCH parcial sobre `original_photo` e `current_photo`; envie ao menos um campo.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'evolutionId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  original_photo: { type: 'string', nullable: true },
                  current_photo: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Atualizada' },
          '400': { description: 'Corpo inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Usuário não é aluna' },
          '404': { description: 'Não encontrada' },
        },
      },
    },
    '/student/physicals/{physicalId}': {
      get: {
        summary: 'Obter um registro físico',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'physicalId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': { description: 'Registro encontrado' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Usuário não é aluna' },
          '404': { description: 'Registro não encontrado' },
        },
      },
      patch: {
        summary: 'Atualizar registro físico',
        description: 'PATCH parcial; envie ao menos um campo.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'physicalId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  weight: { type: 'number', nullable: true },
                  height: { type: 'number', nullable: true },
                  objective: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Registro atualizado' },
          '400': { description: 'Corpo inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Usuário não é aluna' },
          '404': { description: 'Registro não encontrado' },
        },
      },
    },
    '/programs': {
      get: {
        summary: 'Listar programas',
        description:
          'Catálogo paginado; mais recentes primeiro. Alunas e treinadoras autenticadas.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'Lista paginada em items, total, page, pageSize',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['items', 'total', 'page', 'pageSize'],
                  properties: {
                    items: { type: 'array', items: { type: 'object' } },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                  },
                },
              },
            },
          },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Não cadastrado como aluna nem treinadora' },
        },
      },
      post: {
        summary: 'Criar programa',
        description: 'Somente treinadora autenticada.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  photo: { type: 'string', nullable: true },
                  status: { type: 'boolean', nullable: true },
                  type: { type: 'string', nullable: true, enum: ['casa', 'academia', 'ambos'] },
                  description: { type: 'string', nullable: true },
                  level: {
                    type: 'string',
                    nullable: true,
                    enum: ['iniciante', 'intermediário', 'avançado'],
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Programa criado' },
          '400': { description: 'Corpo inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
        },
      },
    },
    '/programs/{programId}': {
      get: {
        summary: 'Obter programa por id',
        description: 'Alunas e treinadoras autenticadas.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'programId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': { description: 'Programa' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Não cadastrado como aluna nem treinadora' },
          '404': { description: 'Programa não encontrado' },
        },
      },
      patch: {
        summary: 'Atualizar programa',
        description: 'Somente treinadora. PATCH parcial.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'programId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  name: { type: 'string', nullable: true },
                  photo: { type: 'string', nullable: true },
                  status: { type: 'boolean', nullable: true },
                  type: { type: 'string', nullable: true },
                  description: { type: 'string', nullable: true },
                  level: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Atualizado' },
          '400': { description: 'Corpo inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '404': { description: 'Programa não encontrado' },
        },
      },
      delete: {
        summary: 'Excluir programa',
        description: 'Somente treinadora. Vínculos em exercicios↔programa são removidos em cascata.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'programId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '204': { description: 'Excluído' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '404': { description: 'Programa não encontrado' },
        },
      },
    },
    '/posts': {
      get: {
        summary: 'Listar posts (feed)',
        description:
          'Feed global, posts mais recentes primeiro (`created_at` desc). Paginação `page` e `pageSize` (máx. 100; padrão página 1 e 10 itens).',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'Lista paginada de posts',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['items', 'total', 'page', 'pageSize'],
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          author_id: { type: 'string', format: 'uuid', nullable: true },
                          author_type: { type: 'string', nullable: true, enum: ['student', 'trainer'] },
                          content: { type: 'string', nullable: true },
                          image: { type: 'string', nullable: true },
                          created_at: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                  },
                },
              },
            },
          },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Usuário não é aluna nem treinadora' },
        },
      },
      post: {
        summary: 'Criar post',
        description:
          'Aluna ou treinadora autenticada. Exige ao menos `content` ou `image`. O autor é inferido do token (`author_id`/`author_type`).',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  content: { type: 'string', nullable: true },
                  image: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Post criado' },
          '400': { description: 'Corpo inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Usuário não é aluna nem treinadora' },
        },
      },
    },
    '/posts/{postId}': {
      patch: {
        summary: 'Editar post (apenas dono)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'postId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  content: { type: 'string', nullable: true },
                  image: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Post atualizado' },
          '400': { description: 'Corpo inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Post não encontrado' },
        },
      },
      delete: {
        summary: 'Excluir post',
        description:
          'Dono do post pode excluir. Treinadora pode excluir post de aluna vinculada a ela. Não exclui post de outra treinadora.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'postId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '204': { description: 'Excluído' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Post não encontrado' },
        },
      },
    },
    '/posts/{postId}/comments': {
      get: {
        summary: 'Listar comentários do post',
        description:
          'Comentários ordenados por `created_at` crescente. Paginação `page` e `pageSize` (máx. 100), padrão página 1 e 10 itens.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'postId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'Lista paginada de comentários',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['items', 'total', 'page', 'pageSize'],
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          post_id: { type: 'integer' },
                          author_id: { type: 'string', format: 'uuid', nullable: true },
                          author_type: { type: 'string', nullable: true, enum: ['student', 'trainer'] },
                          content: { type: 'string', nullable: true },
                          created_at: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                  },
                },
              },
            },
          },
          '401': { description: 'Token ausente ou inválido' },
          '404': { description: 'Post não encontrado' },
        },
      },
      post: {
        summary: 'Comentar post',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'postId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: { content: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Comentário criado' },
          '400': { description: 'Corpo inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Usuário não é aluna nem treinadora' },
          '404': { description: 'Post não encontrado' },
        },
      },
    },
    '/posts/{postId}/comments/{commentId}': {
      patch: {
        summary: 'Editar comentário (apenas dono)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'postId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
          { name: 'commentId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: { content: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Comentário atualizado' },
          '400': { description: 'Corpo inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Não encontrado' },
        },
      },
      delete: {
        summary: 'Excluir comentário',
        description:
          'Dono do comentário pode excluir. Treinadora pode excluir comentário de aluna vinculada a ela.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'postId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
          { name: 'commentId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '204': { description: 'Excluído' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Não encontrado' },
        },
      },
    },
    '/posts/{postId}/likes': {
      get: {
        summary: 'Listar curtidas do post',
        description:
          'Likes ordenados por `created_at` crescente. Paginação `page` e `pageSize` (máx. 100). Ações de curtir/descurtir usam o singular `/posts/{postId}/like`.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'postId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'Lista paginada de curtidas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['items', 'total', 'page', 'pageSize'],
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          post_id: { type: 'integer' },
                          author_id: { type: 'string', format: 'uuid', nullable: true },
                          author_type: { type: 'string', nullable: true, enum: ['student', 'trainer'] },
                          created_at: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                  },
                },
              },
            },
          },
          '401': { description: 'Token ausente ou inválido' },
          '404': { description: 'Post não encontrado' },
        },
      },
    },
    '/posts/{postId}/like': {
      post: {
        summary: 'Dar like no post',
        description: 'Idempotente: se já existir like, responde 204 sem duplicar.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'postId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '204': { description: 'Like registrado ou já existente' },
          '401': { description: 'Token ausente ou inválido' },
          '404': { description: 'Post não encontrado' },
        },
      },
      delete: {
        summary: 'Remover like do post',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'postId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '204': { description: 'Like removido' },
          '401': { description: 'Token ausente ou inválido' },
          '404': { description: 'Post ou like não encontrado' },
        },
      },
    },
    '/trainer/sets': {
      get: {
        summary: 'Listar sets',
        description: 'Catálogo paginado; mais recentes primeiro.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'Lista paginada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          name: { type: 'string', nullable: true },
                          order: { type: 'string', nullable: true },
                          created_at: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                  },
                },
              },
            },
          },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
        },
      },
      post: {
        summary: 'Criar set',
        description: 'Ao menos um dos campos (`name` ou `order`) deve ter texto após trim.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', nullable: true },
                  order: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Criado' },
          '400': { description: 'Corpo inválido (informe name ou order)' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
        },
      },
    },
    '/trainer/sets/{setId}': {
      get: {
        summary: 'Obter set por id',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'setId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': { description: 'Set' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '404': { description: 'Não encontrado' },
        },
      },
      patch: {
        summary: 'Atualizar set',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'setId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  name: { type: 'string', nullable: true },
                  order: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Atualizado' },
          '400': { description: 'Corpo inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '404': { description: 'Não encontrado' },
        },
      },
      delete: {
        summary: 'Excluir set',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'setId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '204': { description: 'Excluído' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '404': { description: 'Não encontrado' },
        },
      },
    },
    '/trainer/sets-to-trainings': {
      get: {
        summary: 'Listar vínculos set↔treino',
        description:
          'Paginado, mais recentes primeiro. Somente treinadora. Forma da resposta depende dos filtros:\n' +
          '- Apenas `trainingId`: retorna os sets daquele treino.\n' +
          '- Apenas `setId`: retorna os treinos daquele set.\n' +
          '- Sem filtro (ou ambos): retorna o vínculo com `training` e `set` aninhados.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
          { name: 'trainingId', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'setId', in: 'query', schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': {
            description: 'Lista paginada em items, total, page, pageSize',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['items', 'total', 'page', 'pageSize'],
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        oneOf: [
                          {
                            type: 'object',
                            description: 'Vínculo completo (sem filtro ou ambos os filtros).',
                            properties: {
                              id: { type: 'integer' },
                              training_id: { type: 'integer' },
                              set_id: { type: 'integer' },
                              created_at: { type: 'string', format: 'date-time' },
                              training: {
                                type: 'object',
                                nullable: true,
                                properties: {
                                  id: { type: 'integer' },
                                  lyric: { type: 'string', nullable: true },
                                  description: { type: 'string', nullable: true },
                                  created_at: { type: 'string', format: 'date-time' },
                                },
                              },
                              set: {
                                type: 'object',
                                nullable: true,
                                properties: {
                                  id: { type: 'integer' },
                                  name: { type: 'string', nullable: true },
                                  order: { type: 'string', nullable: true },
                                  created_at: { type: 'string', format: 'date-time' },
                                },
                              },
                            },
                          },
                          {
                            type: 'object',
                            description: 'Set (quando filtra apenas por trainingId).',
                            properties: {
                              id: { type: 'integer' },
                              name: { type: 'string', nullable: true },
                              order: { type: 'string', nullable: true },
                              created_at: { type: 'string', format: 'date-time' },
                            },
                          },
                          {
                            type: 'object',
                            description: 'Treino (quando filtra apenas por setId).',
                            properties: {
                              id: { type: 'integer' },
                              lyric: { type: 'string', nullable: true },
                              description: { type: 'string', nullable: true },
                              created_at: { type: 'string', format: 'date-time' },
                            },
                          },
                        ],
                      },
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                  },
                },
              },
            },
          },
          '400': { description: 'Filtro inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
        },
      },
      post: {
        summary: 'Criar vínculo set↔treino',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['training_id', 'set_id'],
                properties: {
                  training_id: { type: 'integer', minimum: 1 },
                  set_id: { type: 'integer', minimum: 1 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Criado' },
          '400': { description: 'Corpo inválido ou FK inexistente' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '409': { description: 'Vínculo já existe (training_id, set_id)' },
        },
      },
    },
    '/trainer/sets-to-trainings/{id}': {
      get: {
        summary: 'Obter vínculo por id',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': { description: 'Vínculo' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '404': { description: 'Vínculo não encontrado' },
        },
      },
      patch: {
        summary: 'Atualizar vínculo',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  training_id: { type: 'integer', minimum: 1 },
                  set_id: { type: 'integer', minimum: 1 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Atualizado' },
          '400': { description: 'Corpo inválido ou FK inexistente' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '404': { description: 'Vínculo não encontrado' },
          '409': { description: 'Vínculo (training_id, set_id) já existe' },
        },
      },
      delete: {
        summary: 'Excluir vínculo',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '204': { description: 'Excluído' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '404': { description: 'Vínculo não encontrado' },
        },
      },
    },
    '/trainer/trainings': {
      get: {
        summary: 'Listar treinos (trainings)',
        description: 'Catálogo paginado; mais recentes primeiro.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
        ],
        responses: {
          '200': { description: 'items, total, page, pageSize' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
        },
      },
      post: {
        summary: 'Criar treino',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  lyric: { type: 'string', nullable: true },
                  description: { type: 'string', nullable: true },
                },
                description: 'Ao menos um dos dois com texto após trim.',
              },
            },
          },
        },
        responses: {
          '201': { description: 'Criado' },
          '400': { description: 'Corpo inválido (informe lyric ou description)' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
        },
      },
    },
    '/trainer/trainings/{trainingId}': {
      get: {
        summary: 'Obter treino por id',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'trainingId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': { description: 'Treino' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '404': { description: 'Não encontrado' },
        },
      },
      patch: {
        summary: 'Atualizar treino',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'trainingId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  lyric: { type: 'string', nullable: true },
                  description: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Atualizado' },
          '400': { description: 'Corpo inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '404': { description: 'Não encontrado' },
        },
      },
      delete: {
        summary: 'Excluir treino',
        description: 'Remove vínculos em exercicios↔treino em cascata.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'trainingId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '204': { description: 'Excluído' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '404': { description: 'Não encontrado' },
        },
      },
    },
    '/trainer/exercises': {
      get: {
        summary: 'Listar exercícios (exercises)',
        description: 'Catálogo paginado; mais recentes primeiro.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
        ],
        responses: {
          '200': { description: 'items, total, page, pageSize' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
        },
      },
      post: {
        summary: 'Criar exercício',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', nullable: true },
                  video: { type: 'string', nullable: true },
                  type: { type: 'string', nullable: true, enum: ['casa', 'academia', 'ambos'] },
                  description: { type: 'string', nullable: true },
                  level: {
                    type: 'string',
                    nullable: true,
                    enum: ['iniciante', 'intermediário', 'avançado'],
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Criado' },
          '400': { description: 'Corpo inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
        },
      },
    },
    '/trainer/exercises/{exerciseId}': {
      get: {
        summary: 'Obter exercício por id',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'exerciseId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': { description: 'Exercício' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '404': { description: 'Não encontrado' },
        },
      },
      patch: {
        summary: 'Atualizar exercício',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'exerciseId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  name: { type: 'string', nullable: true },
                  video: { type: 'string', nullable: true },
                  type: { type: 'string', nullable: true, enum: ['casa', 'academia', 'ambos'] },
                  description: { type: 'string', nullable: true },
                  level: {
                    type: 'string',
                    nullable: true,
                    enum: ['iniciante', 'intermediário', 'avançado'],
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Atualizado' },
          '400': { description: 'Corpo inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '404': { description: 'Não encontrado' },
        },
      },
      delete: {
        summary: 'Excluir exercício',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'exerciseId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '204': { description: 'Excluído' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '404': { description: 'Não encontrado' },
        },
      },
    },
    '/exercises/{exerciseId}': {
      get: {
        summary: 'Obter exercício por id',
        description: 'Aluna e treinadora autenticadas. Mesma carga útil que `/trainer/exercises/{exerciseId}`.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'exerciseId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': {
            description: 'Exercício',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    name: { type: 'string', nullable: true },
                    video: { type: 'string', nullable: true },
                    type: { type: 'string', nullable: true, enum: ['casa', 'academia', 'ambos'] },
                    description: { type: 'string', nullable: true },
                    level: {
                      type: 'string',
                      nullable: true,
                      enum: ['iniciante', 'intermediário', 'avançado'],
                    },
                    created_at: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Não cadastrado como aluna nem treinadora' },
          '404': { description: 'Exercício não encontrado' },
        },
      },
    },
    '/exercises-to-programs': {
      get: {
        summary: 'Listar vínculos exercício↔programa',
        description:
          'Paginado, mais recentes primeiro. Aluna e treinadora autenticadas. Forma da resposta depende dos filtros:\n' +
          '- Apenas `programId`: retorna os exercícios daquele programa.\n' +
          '- Apenas `exerciseId`: retorna os programas daquele exercício.\n' +
          '- Sem filtro (ou ambos): retorna o vínculo com `program` e `exercise` aninhados.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
          { name: 'programId', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'exerciseId', in: 'query', schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': {
            description: 'Lista paginada em items, total, page, pageSize',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['items', 'total', 'page', 'pageSize'],
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        oneOf: [
                          {
                            type: 'object',
                            description: 'Vínculo completo (sem filtro ou ambos os filtros).',
                            properties: {
                              id: { type: 'integer' },
                              program_id: { type: 'integer' },
                              exercise_id: { type: 'integer' },
                              created_at: { type: 'string', format: 'date-time' },
                              program: {
                                type: 'object',
                                nullable: true,
                                properties: {
                                  id: { type: 'integer' },
                                  name: { type: 'string', nullable: true },
                                  photo: { type: 'string', nullable: true },
                                  status: { type: 'boolean', nullable: true },
                                  type: { type: 'string', nullable: true },
                                  description: { type: 'string', nullable: true },
                                  level: { type: 'string', nullable: true },
                                  created_at: { type: 'string', format: 'date-time' },
                                },
                              },
                              exercise: {
                                type: 'object',
                                nullable: true,
                                properties: {
                                  id: { type: 'integer' },
                                  name: { type: 'string', nullable: true },
                                  video: { type: 'string', nullable: true },
                                  type: { type: 'string', nullable: true },
                                  description: { type: 'string', nullable: true },
                                  level: { type: 'string', nullable: true },
                                  created_at: { type: 'string', format: 'date-time' },
                                },
                              },
                            },
                          },
                          {
                            type: 'object',
                            description: 'Exercício (quando filtra apenas por programId).',
                            properties: {
                              id: { type: 'integer' },
                              name: { type: 'string', nullable: true },
                              video: { type: 'string', nullable: true },
                              type: { type: 'string', nullable: true },
                              description: { type: 'string', nullable: true },
                              level: { type: 'string', nullable: true },
                              created_at: { type: 'string', format: 'date-time' },
                            },
                          },
                          {
                            type: 'object',
                            description: 'Programa (quando filtra apenas por exerciseId).',
                            properties: {
                              id: { type: 'integer' },
                              name: { type: 'string', nullable: true },
                              photo: { type: 'string', nullable: true },
                              status: { type: 'boolean', nullable: true },
                              type: { type: 'string', nullable: true },
                              description: { type: 'string', nullable: true },
                              level: { type: 'string', nullable: true },
                              created_at: { type: 'string', format: 'date-time' },
                            },
                          },
                        ],
                      },
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                  },
                },
              },
            },
          },
          '400': { description: 'Filtro inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Não cadastrado como aluna nem treinadora' },
        },
      },
      post: {
        summary: 'Criar vínculo exercício↔programa',
        description: 'Somente treinadora autenticada.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['program_id', 'exercise_id'],
                properties: {
                  program_id: { type: 'integer', minimum: 1 },
                  exercise_id: { type: 'integer', minimum: 1 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Criado' },
          '400': { description: 'Corpo inválido ou FK inexistente' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '409': { description: 'Vínculo já existe (program_id, exercise_id)' },
        },
      },
    },
    '/exercises-to-programs/{id}': {
      get: {
        summary: 'Obter vínculo por id',
        description: 'Aluna e treinadora autenticadas.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': { description: 'Vínculo' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Não cadastrado como aluna nem treinadora' },
          '404': { description: 'Vínculo não encontrado' },
        },
      },
      patch: {
        summary: 'Atualizar vínculo',
        description: 'Somente treinadora.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  program_id: { type: 'integer', minimum: 1 },
                  exercise_id: { type: 'integer', minimum: 1 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Atualizado' },
          '400': { description: 'Corpo inválido ou FK inexistente' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '404': { description: 'Vínculo não encontrado' },
          '409': { description: 'Vínculo (program_id, exercise_id) já existe' },
        },
      },
      delete: {
        summary: 'Excluir vínculo',
        description: 'Somente treinadora.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '204': { description: 'Excluído' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '404': { description: 'Vínculo não encontrado' },
        },
      },
    },
    '/exercises-to-trainings': {
      get: {
        summary: 'Listar vínculos exercício↔treino',
        description:
          'Paginado, mais recentes primeiro. Aluna e treinadora autenticadas. Forma da resposta depende dos filtros:\n' +
          '- Apenas `trainingId`: retorna os exercícios daquele treino.\n' +
          '- Apenas `exerciseId`: retorna os treinos daquele exercício.\n' +
          '- Sem filtro (ou ambos): retorna o vínculo com `training` e `exercise` aninhados.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
          { name: 'trainingId', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'exerciseId', in: 'query', schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': {
            description: 'Lista paginada em items, total, page, pageSize',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['items', 'total', 'page', 'pageSize'],
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        oneOf: [
                          {
                            type: 'object',
                            description: 'Vínculo completo (sem filtro ou ambos os filtros).',
                            properties: {
                              id: { type: 'integer' },
                              training_id: { type: 'integer' },
                              exercise_id: { type: 'integer' },
                              created_at: { type: 'string', format: 'date-time' },
                              training: {
                                type: 'object',
                                nullable: true,
                                properties: {
                                  id: { type: 'integer' },
                                  lyric: { type: 'string', nullable: true },
                                  description: { type: 'string', nullable: true },
                                  created_at: { type: 'string', format: 'date-time' },
                                },
                              },
                              exercise: {
                                type: 'object',
                                nullable: true,
                                properties: {
                                  id: { type: 'integer' },
                                  name: { type: 'string', nullable: true },
                                  video: { type: 'string', nullable: true },
                                  type: { type: 'string', nullable: true },
                                  description: { type: 'string', nullable: true },
                                  level: { type: 'string', nullable: true },
                                  created_at: { type: 'string', format: 'date-time' },
                                },
                              },
                            },
                          },
                          {
                            type: 'object',
                            description: 'Exercício (quando filtra apenas por trainingId).',
                            properties: {
                              id: { type: 'integer' },
                              name: { type: 'string', nullable: true },
                              video: { type: 'string', nullable: true },
                              type: { type: 'string', nullable: true },
                              description: { type: 'string', nullable: true },
                              level: { type: 'string', nullable: true },
                              created_at: { type: 'string', format: 'date-time' },
                            },
                          },
                          {
                            type: 'object',
                            description: 'Treino (quando filtra apenas por exerciseId).',
                            properties: {
                              id: { type: 'integer' },
                              lyric: { type: 'string', nullable: true },
                              description: { type: 'string', nullable: true },
                              created_at: { type: 'string', format: 'date-time' },
                            },
                          },
                        ],
                      },
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                  },
                },
              },
            },
          },
          '400': { description: 'Filtro inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Não cadastrado como aluna nem treinadora' },
        },
      },
      post: {
        summary: 'Criar vínculo exercício↔treino',
        description: 'Somente treinadora autenticada.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['training_id', 'exercise_id'],
                properties: {
                  training_id: { type: 'integer', minimum: 1 },
                  exercise_id: { type: 'integer', minimum: 1 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Criado' },
          '400': { description: 'Corpo inválido ou FK inexistente' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '409': { description: 'Vínculo já existe (training_id, exercise_id)' },
        },
      },
    },
    '/exercises-to-trainings/{id}': {
      get: {
        summary: 'Obter vínculo por id',
        description: 'Aluna e treinadora autenticadas.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': { description: 'Vínculo' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Não cadastrado como aluna nem treinadora' },
          '404': { description: 'Vínculo não encontrado' },
        },
      },
      patch: {
        summary: 'Atualizar vínculo',
        description: 'Somente treinadora.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  training_id: { type: 'integer', minimum: 1 },
                  exercise_id: { type: 'integer', minimum: 1 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Atualizado' },
          '400': { description: 'Corpo inválido ou FK inexistente' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '404': { description: 'Vínculo não encontrado' },
          '409': { description: 'Vínculo (training_id, exercise_id) já existe' },
        },
      },
      delete: {
        summary: 'Excluir vínculo',
        description: 'Somente treinadora.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '204': { description: 'Excluído' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras' },
          '404': { description: 'Vínculo não encontrado' },
        },
      },
    },
    '/sets-to-students': {
      get: {
        summary: 'Listar vínculos aluna ↔ set/treino (setstotrainings)',
        description:
          'Paginado, mais recentes primeiro. **Treinadora:** pode listar sem filtro ou usar `studentId` e/ou `setstotrainingsId`. ' +
          'Apenas `studentId`: linha `setstostudents` (id, validity, status, …) + `sets_to_training` com `set` e `training`. Apenas `setstotrainingsId`: itens são dados resumidos das alunas. ' +
          'Sem filtro ou ambos: vínculo completo com `student` e `sets_to_training` aninhados. **Aluna:** deve usar exatamente um filtro (`studentId` = próprio id) ou (`setstotrainingsId` de vínculo em que participa); sem filtro retorna 403.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
          { name: 'studentId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'setstotrainingsId', in: 'query', schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': {
            description: 'Lista paginada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['items', 'total', 'page', 'pageSize'],
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        oneOf: [
                          {
                            type: 'object',
                            description: 'Vínculo completo',
                            properties: {
                              id: { type: 'integer' },
                              student_id: { type: 'string', format: 'uuid' },
                              setstotrainings_id: { type: 'integer' },
                              validity: { type: 'string', nullable: true },
                              status: { type: 'boolean', nullable: true },
                              created_at: { type: 'string', format: 'date-time' },
                              student: {
                                type: 'object',
                                nullable: true,
                                properties: {
                                  id: { type: 'string', format: 'uuid' },
                                  full_name: { type: 'string' },
                                  photo_perfil: { type: 'string', nullable: true },
                                  email: { type: 'string', format: 'email' },
                                },
                              },
                              sets_to_training: {
                                type: 'object',
                                nullable: true,
                                properties: {
                                  id: { type: 'integer' },
                                  training_id: { type: 'integer' },
                                  set_id: { type: 'integer' },
                                  created_at: { type: 'string', format: 'date-time' },
                                },
                              },
                            },
                          },
                          {
                            type: 'object',
                            description:
                              'Por aluna (filtro apenas studentId): vínculo setstostudents + setstotrainings + set + treino.',
                            properties: {
                              id: { type: 'integer' },
                              student_id: { type: 'string', format: 'uuid' },
                              setstotrainings_id: { type: 'integer' },
                              validity: { type: 'string', nullable: true },
                              status: { type: 'boolean', nullable: true },
                              created_at: { type: 'string', format: 'date-time' },
                              sets_to_training: {
                                type: 'object',
                                nullable: true,
                                properties: {
                                  id: { type: 'integer' },
                                  training_id: { type: 'integer' },
                                  set_id: { type: 'integer' },
                                  created_at: { type: 'string', format: 'date-time' },
                                  set: {
                                    type: 'object',
                                    nullable: true,
                                    properties: {
                                      id: { type: 'integer' },
                                      name: { type: 'string', nullable: true },
                                      order: { type: 'string', nullable: true },
                                      created_at: { type: 'string', format: 'date-time' },
                                    },
                                  },
                                  training: {
                                    type: 'object',
                                    nullable: true,
                                    properties: {
                                      id: { type: 'integer' },
                                      lyric: { type: 'string', nullable: true },
                                      description: { type: 'string', nullable: true },
                                      created_at: { type: 'string', format: 'date-time' },
                                    },
                                  },
                                },
                              },
                            },
                          },
                          {
                            type: 'object',
                            description: 'Aluna resumida (filtro apenas setstotrainingsId)',
                            properties: {
                              id: { type: 'string', format: 'uuid' },
                              full_name: { type: 'string' },
                              photo_perfil: { type: 'string', nullable: true },
                              email: { type: 'string', format: 'email' },
                            },
                          },
                        ],
                      },
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                  },
                },
              },
            },
          },
          '400': { description: 'Parâmetro inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão (aluna sem filtro ou filtro de outra aluna, etc.)' },
        },
      },
      post: {
        summary: 'Criar vínculo aluna ↔ setstotrainings',
        description: 'Somente treinadora; a aluna deve ser sua.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['student_id', 'setstotrainings_id'],
                properties: {
                  student_id: { type: 'string', format: 'uuid' },
                  setstotrainings_id: { type: 'integer', minimum: 1 },
                  validity: { type: 'string', nullable: true },
                  status: { type: 'boolean', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Criado' },
          '400': { description: 'Corpo inválido ou FK inexistente' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Aluna não é sua ou não encontrada' },
          '409': { description: 'Vínculo já existe' },
        },
      },
    },
    '/sets-to-students/{id}': {
      get: {
        summary: 'Obter vínculo por id',
        description: 'Treinadora ou a própria aluna do vínculo.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': { description: 'Vínculo' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Aluna tentando acessar vínculo de outra' },
          '404': { description: 'Não encontrado' },
        },
      },
      patch: {
        summary: 'Atualizar vínculo',
        description: 'Somente treinadora dona da aluna do vínculo.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  student_id: { type: 'string', format: 'uuid' },
                  setstotrainings_id: { type: 'integer', minimum: 1 },
                  validity: { type: 'string', nullable: true },
                  status: { type: 'boolean', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Atualizado' },
          '400': { description: 'Corpo inválido ou FK inexistente' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Não encontrado' },
          '409': { description: 'Conflito de unicidade' },
        },
      },
      delete: {
        summary: 'Excluir vínculo',
        description: 'Somente treinadora dona da aluna do vínculo.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '204': { description: 'Excluído' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Não encontrado' },
        },
      },
    },
    '/reps-to-exercises': {
      get: {
        summary: 'Listar orientações (reps/obs) por exercício',
        description:
          '**Obrigatório:** `exerciseId`. **Aluna:** vê apenas os próprios registros para esse exercício (`student` vem null nos itens). **Treinadora:** vê orientações das suas alunas; opcional `studentId` (UUID) para filtrar uma aluna.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'exerciseId', in: 'query', required: true, schema: { type: 'integer', minimum: 1 } },
          { name: 'studentId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'items, total, page, pageSize',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          exercise_id: { type: 'integer' },
                          student_id: { type: 'string', format: 'uuid' },
                          reps: { type: 'string', nullable: true },
                          obs: { type: 'string', nullable: true },
                          created_at: { type: 'string', format: 'date-time' },
                          student: {
                            type: 'object',
                            nullable: true,
                            properties: {
                              id: { type: 'string', format: 'uuid' },
                              full_name: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                  },
                },
              },
            },
          },
          '400': { description: 'exerciseId ausente ou inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão' },
        },
      },
      post: {
        summary: 'Criar orientação para aluna em um exercício',
        description: 'Somente treinadora; `student_id` deve ser aluna dela. Ao menos um de `reps` ou `obs` com texto.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['exercise_id', 'student_id'],
                properties: {
                  exercise_id: { type: 'integer', minimum: 1 },
                  student_id: { type: 'string', format: 'uuid' },
                  reps: { type: 'string', nullable: true },
                  obs: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Criado' },
          '400': { description: 'Corpo inválido ou FK' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras / aluna não é sua' },
        },
      },
    },
    '/reps-to-exercises/{id}': {
      get: {
        summary: 'Obter orientação por id',
        description: 'Aluna se for dela; treinadora se a aluna for sua.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': { description: 'Registro' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Não encontrado' },
        },
      },
      patch: {
        summary: 'Atualizar orientação',
        description: 'Somente treinadora dona da aluna do registro.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  exercise_id: { type: 'integer', minimum: 1 },
                  student_id: { type: 'string', format: 'uuid' },
                  reps: { type: 'string', nullable: true },
                  obs: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Atualizado' },
          '400': { description: 'Corpo inválido ou FK' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Não encontrado' },
        },
      },
      delete: {
        summary: 'Excluir orientação',
        description: 'Somente treinadora dona da aluna do registro.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '204': { description: 'Excluído' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Não encontrado' },
        },
      },
    },
    '/obs-to-trainings': {
      get: {
        summary: 'Listar observações (obs) por treino',
        description:
          '**Obrigatório:** `trainingId`. **Aluna:** vê apenas os próprios registros para esse treino (`student` vem null nos itens). **Treinadora:** vê observações das suas alunas; opcional `studentId` (UUID) para filtrar uma aluna.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'trainingId', in: 'query', required: true, schema: { type: 'integer', minimum: 1 } },
          { name: 'studentId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'items, total, page, pageSize',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          training_id: { type: 'integer' },
                          student_id: { type: 'string', format: 'uuid' },
                          obs: { type: 'string', nullable: true },
                          created_at: { type: 'string', format: 'date-time' },
                          student: {
                            type: 'object',
                            nullable: true,
                            properties: {
                              id: { type: 'string', format: 'uuid' },
                              full_name: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                  },
                },
              },
            },
          },
          '400': { description: 'trainingId ausente ou inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão' },
        },
      },
      post: {
        summary: 'Criar observação para aluna em um treino',
        description: 'Somente treinadora; `student_id` deve ser aluna dela. `obs` com texto.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['training_id', 'student_id', 'obs'],
                properties: {
                  training_id: { type: 'integer', minimum: 1 },
                  student_id: { type: 'string', format: 'uuid' },
                  obs: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Criado' },
          '400': { description: 'Corpo inválido ou FK' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas treinadoras / aluna não é sua' },
        },
      },
    },
    '/obs-to-trainings/{id}': {
      get: {
        summary: 'Obter observação por id',
        description: 'Aluna se for dela; treinadora se a aluna for sua.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': { description: 'Registro' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Não encontrado' },
        },
      },
      patch: {
        summary: 'Atualizar observação',
        description: 'Somente treinadora dona da aluna do registro.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  training_id: { type: 'integer', minimum: 1 },
                  student_id: { type: 'string', format: 'uuid' },
                  obs: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Atualizado' },
          '400': { description: 'Corpo inválido ou FK' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Não encontrado' },
        },
      },
      delete: {
        summary: 'Excluir observação',
        description: 'Somente treinadora dona da aluna do registro.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '204': { description: 'Excluído' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Não encontrado' },
        },
      },
    },
    '/points': {
      get: {
        summary: 'Listar registros de treino (points)',
        description:
          '**Aluna:** vê apenas os próprios registros (`student` null nos itens). Pode criar vários no mesmo dia. **Treinadora:** vê registros de todas as suas alunas; opcional `studentId` (UUID) para filtrar.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'studentId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'items, total, page, pageSize',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          student_id: { type: 'string', format: 'uuid' },
                          time: { type: 'string', nullable: true },
                          qtt_excercise: { type: 'integer', minimum: 0, nullable: true },
                          created_at: { type: 'string', format: 'date-time' },
                          student: {
                            type: 'object',
                            nullable: true,
                            properties: {
                              id: { type: 'string', format: 'uuid' },
                              full_name: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                  },
                },
              },
            },
          },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão' },
        },
      },
      post: {
        summary: 'Registrar informações do treino (aluna)',
        description:
          'Somente aluna. Ao menos um de `time` (texto) ou `qtt_excercise` (inteiro >= 0). Grava com `student_id` da autenticação e notifica a treinadora no app (push Expo, se houver token).',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  time: { type: 'string', nullable: true, description: 'ex.: duração ou horário' },
                  qtt_excercise: {
                    type: 'integer',
                    minimum: 0,
                    nullable: true,
                    description: 'Quantidade de exercícios (inteiro >= 0)',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Criado (student null na resposta)' },
          '400': { description: 'Corpo inválido; informe time e/ou qtt_excercise válido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas alunas' },
        },
      },
    },
    '/points/{id}': {
      get: {
        summary: 'Obter registro de treino por id',
        description: 'Aluna se for dela; treinadora se a aluna for sua.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': { description: 'Registro' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Não encontrado' },
        },
      },
    },
    '/feedbacks': {
      get: {
        summary: 'Listar feedbacks de treino',
        description:
          '**Aluna:** histórico próprio (`student` null). **Treinadora:** obrigatório `studentId` (UUID de aluna dela); histórico dessa aluna com resumo em `student`.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'studentId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Obrigatório para treinadora; ignorado para aluna (usa o token)',
          },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'items, total, page, pageSize',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          student_id: { type: 'string', format: 'uuid' },
                          effort: { type: 'string', nullable: true },
                          feedback: { type: 'string', nullable: true, description: 'Texto do feedback' },
                          created_at: { type: 'string', format: 'date-time' },
                          student: {
                            type: 'object',
                            nullable: true,
                            properties: {
                              id: { type: 'string', format: 'uuid' },
                              full_name: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                  },
                },
              },
            },
          },
          '400': { description: 'Treinadora sem studentId ou UUID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão' },
        },
      },
      post: {
        summary: 'Registrar feedback após treino (aluna)',
        description:
          'Somente aluna. Ao menos um de `effort` ou `feedback` com texto. Notifica a treinadora (push Expo + registro em notificações).',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  effort: { type: 'string', nullable: true, description: 'Percepção de esforço' },
                  feedback: {
                    type: 'string',
                    nullable: true,
                    description: 'Comentário / texto do feedback',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Criado (student null na resposta)' },
          '400': { description: 'Corpo inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Apenas alunas' },
        },
      },
    },
    '/feedbacks/{id}': {
      get: {
        summary: 'Obter feedback por id',
        description: 'Aluna se for dela; treinadora se a aluna for sua (resposta inclui `student`).',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': { description: 'Registro' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Não encontrado' },
        },
      },
    },
    '/notifications': {
      get: {
        summary: 'Listar minhas notificações',
        description:
          '**Aluna:** notificações em que `student_id` é ela (inbox própria). **Treinadora:** notificações em que `trainer_id` é ela. Ordem: `created_at` desc. Paginação `page`, `pageSize` (máx. 100).',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'items, total, page, pageSize',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          student_id: { type: 'string', format: 'uuid', nullable: true },
                          trainer_id: { type: 'string', format: 'uuid', nullable: true },
                          title: { type: 'string' },
                          message: { type: 'string' },
                          read: { type: 'boolean' },
                          type: { type: 'string' },
                          created_at: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                  },
                },
              },
            },
          },
          '401': { description: 'Token ausente ou inválido' },
          '403': {
            description: 'Usuário não é aluna nem treinadora cadastrado no sistema',
          },
        },
      },
    },
    '/notifications/{id}': {
      get: {
        summary: 'Obter uma notificação por id',
        description:
          'Só devolve se a notificação for da inbox da aluna ou da treinadora autenticada (mesmas regras da listagem).',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': { description: 'Registro' },
          '400': { description: 'ID inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Não encontrado ou não é sua inbox' },
        },
      },
    },
    '/conversations/messages': {
      get: {
        summary: 'Listar mensagens da conversa (histórico)',
        description:
          'Aluna lista só a própria conversa. Treinadora **deve** enviar `studentId` (uuid da aluna). Ordenação descendente (`created_at`, `id`). Cada mensagem aparece uma linha com `sender_role` e `body` (`trainer_message` ou `student_message` na BD). Mensagens ao vivo continuam sendo recebidas via WebSocket `/ws/conversations` (tag Conversas).',
        tags: ['Conversas'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'studentId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Obrigatório para treinadora; ignorado para aluna',
          },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'items, total, page, pageSize',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          student_id: { type: 'string', format: 'uuid' },
                          sender_role: { type: 'string', enum: ['trainer', 'student'] },
                          body: { type: 'string' },
                          created_at: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                  },
                },
              },
            },
          },
          '400': { description: 'Treinadora sem studentId' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Sem permissão nesta conversa' },
        },
      },
    },
    '/trainer/students': {
      get: {
        summary: 'Listar alunas do treinador',
        description:
          'Lista alunas vinculadas ao treinador autenticado, ordenadas por nome (`full_name` ASC). Paginação via `page` e `pageSize` (máx. 100).',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
            description: 'Página (1-based)',
          },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            description: 'Itens por página',
          },
        ],
        responses: {
          '200': {
            description: 'Lista paginada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: { type: 'array', items: { type: 'object' } },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                  },
                },
              },
            },
          },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Usuário não é treinador' },
        },
      },
    },
    '/trainer/students/search': {
      get: {
        summary: 'Pesquisar alunas (nome ou e-mail)',
        description:
          'Busca por substring com `unaccent` + case-insensitive (ex.: "maria" encontra María, MARIA). O treinador escolhe o campo com `field=name` ou `field=email`.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'field',
            in: 'query',
            required: true,
            schema: { type: 'string', enum: ['name', 'email'] },
            description: 'Campo da busca',
          },
          {
            name: 'q',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Termo de busca',
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'Resultados paginados (mesmo formato da listagem)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: { type: 'array', items: { type: 'object' } },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                  },
                },
              },
            },
          },
          '400': { description: 'field ou q inválidos' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Usuário não é treinador' },
        },
      },
    },
    '/trainer/students/{studentId}/anamnesis': {
      delete: {
        summary: 'Excluir anamnese(s) da aluna',
        description:
          'Remove todos os registros de anamnese (`anamneses`) da aluna, desde que ela pertença ao treinador autenticado.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'studentId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '204': { description: 'Excluído (sem corpo)' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Usuário não é treinador' },
          '404': { description: 'Aluna não encontrada ou anamnese inexistente' },
        },
      },
    },
    '/trainer/students/{studentId}/evolutions': {
      get: {
        summary: 'Listar evoluções da aluna',
        description:
          'Lista `evolutions` da aluna, desde que ela esteja vinculada ao treinador autenticado.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'studentId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Lista em `items`',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Usuário não é treinador' },
          '404': { description: 'Aluna não encontrada' },
        },
      },
    },
    '/trainer/students/{studentId}/physicals': {
      get: {
        summary: 'Listar registros físicos da aluna',
        description:
          'Lista os registros da tabela `physicals` da aluna, desde que ela pertença ao treinador autenticado.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'studentId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Lista em `items`',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Usuário não é treinador' },
          '404': { description: 'Aluna não encontrada' },
        },
      },
    },
    '/trainer/students/{studentId}': {
      get: {
        summary: 'Obter uma aluna',
        description: 'Retorna a aluna se ela pertencer ao treinador autenticado.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'studentId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': { description: 'Dados da aluna (sem refresh_token nem expo_push_token)' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Usuário não é treinador' },
          '404': { description: 'Aluna não encontrada' },
        },
      },
      patch: {
        summary: 'Atualizar dados da aluna',
        description:
          'Mesmos campos opcionais do PATCH /auth/me para aluna (`name`, `photo_perfil`, `phone`, `email`, `expo_push_token`, `birth`, `cpf`, `type_plan`, `height`, `weight`).',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'studentId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  name: { type: 'string' },
                  phone: { type: 'string', nullable: true },
                  email: { type: 'string', format: 'email' },
                  expo_push_token: { type: 'string', nullable: true },
                  birth: { type: 'string', nullable: true },
                  cpf: { type: 'string', nullable: true },
                  type_plan: { type: 'string', nullable: true },
                  height: { type: 'number', nullable: true },
                  weight: { type: 'number', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Aluna atualizada' },
          '400': { description: 'Corpo inválido' },
          '401': { description: 'Token ausente ou inválido' },
          '403': { description: 'Usuário não é treinador' },
          '404': { description: 'Aluna não encontrada' },
          '409': { description: 'Conflito no banco' },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        summary: 'Esqueci a senha',
        description: 'Solicita o envio de um código por e-mail para redefinir a senha.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Se o e-mail existir, você receberá um código para redefinir a senha.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': { description: 'E-mail é obrigatório' },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        summary: 'Redefinir senha',
        description: 'Altera a senha usando o código recebido por e-mail.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'code', 'newPassword'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  code: { type: 'string', description: 'Código recebido por e-mail' },
                  newPassword: { type: 'string', description: 'Nova senha' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Senha alterada com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': { description: 'Código inválido, expirado ou senha fora do padrão' },
        },
      },
    },
    '/auth/resend-forgot-password': {
      post: {
        summary: 'Reenviar código de recuperação de senha',
        description:
          'Chama novamente o fluxo de esqueci a senha no Cognito (ForgotPassword) para enviar um novo código ao e-mail.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Processado (mensagem genérica se o e-mail existir).',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': { description: 'E-mail ausente ou inválido' },
          '429': { description: 'Limite de tentativas excedido' },
        },
      },
    },
    '/auth/resend-confirmation': {
      post: {
        summary: 'Reenviar código de confirmação de cadastro',
        description:
          'Reenvia o código de verificação para confirmar o e-mail após o registro (ResendConfirmationCode no Cognito).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Processado (mensagem genérica se aplicável).',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': { description: 'E-mail ausente ou usuário já confirmado / inválido' },
          '429': { description: 'Limite de tentativas excedido' },
        },
      },
    },
  },
};
