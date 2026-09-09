# Deploy e operação

## Pré-requisitos

- Projeto Supabase criado.
- Migrations em supabase/migrations aplicadas no banco correto.
- Projeto Vercel conectado ao repositório ou diretório de deploy.
- Variáveis públicas e server-only cadastradas na Vercel.

## Variáveis

NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são usadas pela aplicação e podem ser expostas ao navegador conforme o prefixo.

SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY, GEMINI_MODEL, BILLING_PROVIDER e BILLING_WEBHOOK_SECRET são server-only. Nunca devem ter prefixo NEXT_PUBLIC, entrar no bundle ou ser colocadas em git.

## Publicação

1. Configure as variáveis no ambiente de preview.
2. Aplique a migration usando o fluxo oficial do Supabase.
3. Teste health, cadastro, confirmação de e-mail, upload e geração em preview.
4. Promova para produção.
5. Configure o redirect de autenticação e o domínio da aplicação no Supabase.
6. Configure o endpoint de webhook do provedor de billing somente quando o adaptador estiver implementado.

## Verificação pós deploy

- GET /api/health deve responder com estado operacional.
- GET /api/config/public deve retornar somente configuração pública.
- Uma conta de teste deve acessar apenas seus próprios registros.
- Uploads devem permanecer em buckets privados.
- O bundle do navegador não pode conter chaves server-only.
- Logs devem ser revisados sem registrar senha, token, imagem ou segredo.
