# Área administrativa

## Acesso

O usuário precisa estar autenticado e ter registro ativo em admin_roles. A role é verificada no servidor; URL, cookie, localStorage e payload não concedem acesso.

## Dados

As métricas são consultadas com cliente Supabase server-only usando SUPABASE_SERVICE_ROLE_KEY, depois da validação da role. A chave nunca chega ao navegador. A página mostra contas, peças, looks, chamadas de IA, custo e latência registrados, contatos pendentes, assinaturas ativas e auditoria disponível no banco.

A visão global também mostra usuários ativos nos últimos 30 dias, novos cadastros, evolução de cadastros em 14 dias, jornada de onboarding, looks usados, favoritos, receita registrada em `billing_events` e estado de banco, Storage, IA e billing. O ativo `profiles.last_seen_at` precisa existir para a métrica de atividade; ele é criado pela migration `20260907_000003_global_admin.sql`.

A busca de usuários consulta somente a área administrativa e expõe nome, e-mail, estado do acesso, onboarding, assinatura ativa e uso mensal registrado por contador. Roles `manager` e `owner` podem bloquear ou desbloquear uma conta; `support` mantém acesso de leitura. A mutação repete a validação no servidor e gera `audit_logs`.

## Central do proprietário

As responsabilidades ficam separadas no menu do painel. Em `/admin/produto`, `/admin/conteudo` e `/admin/configuracoes`, `manager` e `owner` podem administrar os controles do negócio:

- cadastrar e editar planos, preços, recursos e limites;
- cadastrar e editar feature flags e percentual de rollout;
- cadastrar e editar configurações globais salvas como JSON;
- editar a chamada principal, botão, frase do rodapé e FAQ do site público;
- caixa de entrada de contatos e feedbacks;
- métricas de IA, custo estimado, latência e falhas;
- usuários, bloqueios, papéis, plano ativo e uso mensal;
- auditoria e suporte ficam em `/admin/auditoria` e `/admin/suporte`.

O papel `support` consegue consultar o painel, mas não altera dados. Toda alteração feita pela central passa por validação server-side e gera um evento em `audit_logs`.

Os formulários de cadastro ficam na página responsável por cada recurso. Códigos de plano e chaves de flag/configuração são identificadores únicos; o painel informa quando um item já existe. Limites de plano são validados como números inteiros e valores globais como JSON antes de serem salvos.

O bloco `public.site_content` possui um editor próprio para o conteúdo institucional. Ele valida campos e perguntas no servidor, grava a alteração em `system_settings`, registra a ação em `audit_logs` e revalida a home e o FAQ para que a publicação fique disponível sem novo deploy.

## Primeiro acesso do dono

Depois de criar a conta do proprietário no Roupzy, execute no SQL Editor do Supabase:

```sql
insert into public.admin_roles (user_id, role)
select id, 'owner'
from auth.users
where email = 'seu-email@exemplo.com'
on conflict (user_id)
do update set role = 'owner', revoked_at = null;
```

Esse passo deve ser feito apenas pelo responsável pelo projeto, usando o painel do Supabase.

## Auditoria

A tabela audit_logs registra ator, role, ação, recurso, resultado, request id e timestamp. A aplicação deve registrar ações sensíveis como bloqueio, alteração de plano, configuração global e mudanças de acesso antes de habilitá-las no painel.

## Princípio operacional

O painel reduz o acesso a conteúdo privado. Métricas agregadas devem ser preferidas; leitura de imagem, texto ou preferências exige motivo operacional e permissão correspondente.
