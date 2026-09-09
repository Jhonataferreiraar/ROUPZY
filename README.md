# Roupzy

<p align="center">
  <img src="public/brand/roupzy-lockup.svg" alt="Roupzy" width="220">
</p>

<p align="center">
  <strong>Descubra o que vestir usando as roupas que você já tem.</strong>
</p>

Roupzy é um site brasileiro de guarda-roupa inteligente. A pessoa registra as próprias peças, organiza seu closet privado e recebe combinações adequadas à ocasião e à vibe escolhidas. O sistema usa um motor determinístico para montar candidatos reais e mantém a inteligência artificial isolada atrás de um contrato substituível.

O projeto reúne três experiências independentes:

- site institucional e páginas de autenticação;
- espaço privado do cliente em `/app`;
- centro administrativo global em `/admin`.

## Funcionalidades

### Site público

- landing page responsiva com identidade visual própria;
- produto, recursos, planos, empresa, FAQ e contato;
- termos de uso, privacidade e política de cookies;
- cadastro, login, confirmação de e-mail e recuperação de senha;
- SEO, sitemap, robots, manifest e cabeçalhos de segurança.

### Espaço do cliente

- visão geral e onboarding;
- closet privado com cadastro, edição, filtros e disponibilidade;
- upload protegido e validação real de imagem;
- análise de peças com correção manual;
- geração de até três looks usando somente itens do usuário;
- feedback, favoritos e histórico de uso;
- inspiração e correspondência com o closet;
- calendário, cápsulas, cuidados, compras e sustentabilidade;
- estatísticas, notificações, perfil, assinatura e configurações;
- exportação e exclusão da conta.

### Administração global

- acesso administrativo separado do cliente;
- métricas reais de usuários e operação;
- gestão de usuários, bloqueios e funções;
- planos, preços, limites e assinaturas;
- uso e custo de inteligência artificial;
- integrações e estado da configuração;
- conteúdo público, FAQ, feature flags e configurações globais;
- suporte, feedback, moderação, relatórios e auditoria;
- logout e autorização consultada no servidor.

## Stack

- Next.js 16 com App Router;
- React 19;
- JavaScript/JSX na interface;
- TypeScript nas fronteiras de domínio, segurança, banco, IA e billing;
- Supabase Postgres, Auth e Storage privado;
- Zod para validação em runtime;
- Gemini como primeiro adaptador opcional de IA;
- Vercel como destino recomendado de deploy.

## Como executar

Requisitos:

- Node.js compatível com Next.js 16;
- npm;
- um projeto Supabase para autenticação, banco e Storage.

```bash
git clone https://github.com/Jhonataferreiraar/ROUPZY.git
cd ROUPZY
npm install
cp .env.example .env.local
npm run dev
```

No Windows PowerShell, copie o ambiente com:

```powershell
Copy-Item .env.example .env.local
```

O projeto ficará disponível em [http://localhost:3000](http://localhost:3000).

## Variáveis de ambiente

O arquivo `.env.example` documenta os nomes aceitos.

| Variável | Escopo | Finalidade |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Público | URL canônica da aplicação |
| `NEXT_PUBLIC_SUPABASE_URL` | Público | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Público | Chave anônima do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Servidor | Operações administrativas controladas |
| `GEMINI_API_KEY` | Servidor | Análise multimodal |
| `GEMINI_MODEL` | Servidor | Modelo Gemini selecionado |
| `BILLING_PROVIDER` | Servidor | Adaptador de cobrança |
| `BILLING_WEBHOOK_SECRET` | Servidor | Verificação dos webhooks de cobrança |
| `SESSION_SECRET` | Servidor | Controle opcional de sessão |
| `JOB_SECRET` | Servidor | Autorização opcional de tarefas internas |

Nunca envie `.env`, `.env.local`, Service Role, chave de IA ou segredo de webhook ao GitHub. Variáveis sem o prefixo `NEXT_PUBLIC_` não devem ser acessadas no navegador.

## Configuração do Supabase

Crie o projeto e aplique, em ordem, as migrations de `supabase/migrations`:

1. `20260906_000001_initial_schema.sql`;
2. `20260907_000002_mvp_completion.sql`;
3. `20260907_000003_global_admin.sql`;
4. `20260907_000004_quotas_and_plans.sql`.

Depois:

1. configure a URL do site e os redirects de autenticação;
2. habilite confirmação de e-mail conforme o ambiente;
3. confirme que os buckets permanecem privados;
4. configure Google e Apple somente se quiser esses provedores;
5. cadastre a primeira conta normalmente;
6. atribua a função administrativa diretamente em `admin_roles`, por uma operação protegida no painel do Supabase.

O cadastro de uma pessoa nunca concede acesso administrativo automaticamente.

## Rotas principais

| Área | Rotas |
| --- | --- |
| Público | `/`, `/como-funciona`, `/recursos`, `/planos`, `/sobre`, `/faq`, `/contato` |
| Acesso | `/login`, `/cadastro`, `/esqueci-minha-senha`, `/redefinir-senha` |
| Cliente | `/app`, `/app/closet`, `/app/looks`, `/app/inspiracao`, `/app/calendario`, `/app/configuracoes` |
| Admin | `/admin`, `/admin/usuarios`, `/admin/produto`, `/admin/assinaturas`, `/admin/auditoria` |

As páginas em `/app` exigem sessão válida. As páginas em `/admin` exigem sessão e função administrativa ativa. As APIs privadas repetem essas verificações no servidor.

## Qualidade

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Os testes atuais cobrem o motor de looks, correspondência de inspiração e validação binária de imagens.

## Segurança

O projeto inclui RLS, autorização server-side, Storage privado, URLs assinadas, validação de arquivos, schemas de entrada, headers de segurança, rate limiting, quotas atômicas e auditoria administrativa.

Isso não equivale a uma certificação. Antes de produção, ainda é necessário executar testes de isolamento com duas contas reais, revisar as políticas RLS no Supabase aplicado, validar OAuth, realizar testes ativos contra IDOR e escalonamento administrativo e conectar um gateway real antes de habilitar cobrança.

Consulte [docs/SECURITY.md](docs/SECURITY.md) e [docs/TESTING.md](docs/TESTING.md).

## Documentação

- [Arquitetura](docs/ARCHITECTURE.md)
- [Banco de dados](docs/DATABASE.md)
- [Inteligência artificial](docs/AI.md)
- [Administração](docs/ADMIN.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Segurança](docs/SECURITY.md)
- [SaaS e billing](docs/SAAS.md)
- [Deploy](docs/DEPLOYMENT.md)
- [Testes](docs/TESTING.md)
- [Decisões de interface](DESIGN.md)
- [Contrato de experiência](UX-CONTRACT.md)

## Estado das integrações

- **Supabase:** implementação presente; depende das credenciais e migrations do ambiente.
- **Gemini:** adaptador presente; funciona quando a chave e o modelo estão configurados.
- **Google e Apple:** fluxo presente; depende da configuração no Supabase.
- **Billing:** contrato, tabelas e webhook estão preparados. Um adaptador real deve ser conectado e validado antes do uso comercial.

## Licença

Este repositório não declara uma licença de código aberto. Todos os direitos permanecem com o proprietário do projeto.
