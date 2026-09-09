# Banco de dados — Roupzy

Status: migrations versionadas em `supabase/migrations/20260906_000001_initial_schema.sql`, `supabase/migrations/20260907_000002_mvp_completion.sql`, `supabase/migrations/20260907_000003_global_admin.sql` e `supabase/migrations/20260907_000004_quotas_and_plans.sql`. As quatro devem ser aplicadas no projeto Supabase antes do uso autenticado.

## Convenções

- PostgreSQL com `uuid` gerado no banco e `timestamptz` em UTC.
- Toda tabela de domínio que representa dados de uma pessoa tem `owner_id uuid not null references auth.users(id) on delete cascade`, salvo entidades globais, de billing ou administrativas.
- `created_at` e `updated_at` são obrigatórios. Atualização de `updated_at` usa trigger controlada.
- Valores de domínio críticos usam enums ou tabelas de catálogo; JSONB fica restrito a snapshots de fornecedor, configurações versionadas e campos que não precisam de filtro relacional.
- Chaves externas têm índice. Listas privadas começam com índice `(owner_id, created_at desc)` e índices parciais para estados ativos.
- O cliente nunca envia `owner_id`; o servidor o obtém da sessão.
- Exclusão de conta dispara cascata ou job explícito para Storage, filas e dados derivados. A política para backups será definida antes da produção.

## Entidades

### Identidade e closet

| Tabela | Papel | Campos e restrições principais |
| --- | --- | --- |
| `profiles` | Preferências públicas mínimas da conta | `id` igual a `auth.users.id`, `display_name`, `locale`, `onboarding_status`, `blocked_at`; RLS permite somente o próprio usuário |
| `media_assets` | Registro de arquivo privado e sua validação | `id`, `owner_id`, `bucket`, `object_path`, `purpose`, `sha256`, `mime_type`, `byte_size`, `width`, `height`, `status`, `expires_at`; caminho único e nunca fornecido pelo cliente |
| `clothing_items` | Peça do closet | `id`, `owner_id`, `asset_id`, `category`, `subcategory`, `colors`, `pattern`, `material`, `fit`, `formality`, `seasons`, `weather_range`, `availability`, `analysis_status`, `analysis_version`, campos manuais e `deleted_at` |
| `user_preferences` | Preferências de estilo e recomendação | Uma linha por `owner_id`; ocasião, vibes, cores evitadas, tamanhos de composição, unidades e preferências de privacidade |

`media_assets` é uma tabela própria para impedir que Storage seja tratado como banco. `clothing_items.asset_id` e `inspirations.asset_id` têm foreign key real, evitando referências polimórficas sem integridade.

`profiles.last_seen_at` é atualizado server-side quando a sessão do usuário está ativa, com intervalo mínimo de cinco minutos. O painel global usa esse campo para calcular usuários ativos nos últimos 30 dias.

### Looks e inspiração

| Tabela | Papel | Campos e restrições principais |
| --- | --- | --- |
| `outfits` | Uma composição gerada ou montada | `id`, `owner_id`, `occasion`, `vibe`, `weather_snapshot`, `engine_version`, `ranking_version`, `status`, `explanation`, `created_at` |
| `outfit_items` | Peças que compõem o look | PK `(outfit_id, clothing_item_id)`, `owner_id` redundante para políticas e consultas, `role`, `position`; trigger ou caso de uso garante que o dono é o mesmo nos dois lados |
| `outfit_feedback` | Estado atual de curtir, rejeitar ou favoritar | Unique `(owner_id, outfit_id)`, `kind`, `reason`, `updated_at`; valores controlados |
| `outfit_history` | Registro de look usado | `id`, `owner_id`, `outfit_id`, `used_on`, `source`; índice por `(owner_id, used_on desc)` |
| `inspirations` | Referência enviada pelo usuário | `id`, `owner_id`, `asset_id`, `source_type`, `source_url` opcional, `analysis_status`, `analysis_version`, atributos normalizados e `deleted_at` |
| `inspiration_matches` | Relação explicável entre inspiração e peças próprias | `id`, `owner_id`, `inspiration_id`, `clothing_item_id`, `match_type`, `score` somente se calculado, `explanation`, `engine_version`; unique por inspiração e peça |

Um score de compatibilidade só será armazenado quando houver fórmula e versão identificáveis. Texto como “82% compatível” não será derivado de uma impressão do modelo.

### Planos, uso e billing

| Tabela | Papel | Campos e restrições principais |
| --- | --- | --- |
| `plans` | Catálogo de planos | `code`, `name`, `active`, `price_minor`, `currency`, `interval`, `limits jsonb`, `features jsonb`, `display_order`; preços em unidade menor da moeda |
| `subscriptions` | Estado espelhado do provedor | `owner_id`, `plan_id`, `provider`, `provider_customer_id`, `provider_subscription_id`, `status`, períodos, cancelamento; unique por provedor e ID externo |
| `entitlements` | Capacidades efetivas de uma conta | `owner_id`, `key`, `value`, origem, validade; unique `(owner_id, key)`; recalculado por eventos idempotentes |
| `ai_usage` | Uma chamada de IA auditável | `owner_id` opcional para tarefas administrativas, `provider`, `model`, `operation`, `request_key` globalmente único, tokens de entrada/saída quando fornecidos, custo estimado, duração, status, `error_code`, timestamps |
| `usage_counters` | Reserva e consumo atômico de quotas | `owner_id`, período, `metric`, reservado, consumido, limite e timestamps; unique `(owner_id, período, metric)` |
| `billing_events` | Eventos de negócio derivados de cobrança | `owner_id` opcional, provider, tipo, valor, moeda, referência externa, occurred_at; não contém segredo |
| `webhook_events` | Recepção idempotente de webhook | `provider`, `external_event_id`, assinatura verificada, headers mínimos permitidos, corpo redigido ou hash, status, processado em, erro; unique `(provider, external_event_id)` |

As quotas serão consumidas com operação atômica. A leitura de entitlement não concede acesso se a assinatura estiver bloqueada, cancelada ou em estado incompatível com a política do plano.

### Operação, comunicação e governo

| Tabela | Papel | Campos e restrições principais |
| --- | --- | --- |
| `notifications` | Mensagens dirigidas ao usuário | `owner_id`, `kind`, `title`, `body`, `read_at`, `metadata` limitada; RLS do próprio usuário |
| `feedback` | Feedback de produto | `owner_id` opcional, categoria, texto, contexto mínimo, status, resposta segura, timestamps |
| `admin_roles` | Papéis administrativos | `user_id`, `role`, `granted_by`, `granted_at`, `revoked_at`; não editável pela pessoa alvo |
| `audit_logs` | Trilha de ações sensíveis | ator, papel no momento, ação, recurso, resultado, request id, timestamp, metadata redigida; append-only para o aplicativo |
| `system_settings` | Configuração global editável com controle | `key`, valor tipado/versionado, ambiente, `updated_by`, timestamps; allowlist de chaves editáveis |
| `feature_flags` | Liberação gradual | `key`, estado, porcentagem ou allowlist de IDs, início/fim, `updated_by`; sem confiar no cliente para segurança |
| `contact_requests` | Mensagens da página de contato | nome, email, assunto, corpo, consentimento, status e timestamps; rate limit e antiabuso |

O conjunto mínimo do prompt contém 21 entidades; `media_assets`, `inspiration_matches` e `usage_counters` são tabelas de suporte necessárias para cumprir Storage, matching e limites com integridade.

## RLS e propriedades

RLS é habilitado em toda tabela acessível por cliente. A política de leitura inicial para uma tabela privada equivale a `owner_id = auth.uid()`. INSERT, UPDATE e DELETE repetem essa condição e restringem colunas que o usuário não pode alterar. `ai_usage` permite INSERT somente para a própria conta, para registrar a análise solicitada pela pessoa usuária.

Tabelas globais têm leitura pública apenas para campos marcados como publicados. Tabelas administrativas permitem acesso por função server-side e papel verificado; Service Role não é uma autorização de usuário e não será exposta.

Para `outfit_items`, uma policy de proprietário precisa confirmar tanto o dono do vínculo quanto o dono da peça. Uma função SQL auxiliar pode encapsular a checagem, com `security definer` somente quando tiver `search_path` fixo, permissões mínimas e teste de abuso.

Storage usa policies que extraem o primeiro segmento do caminho e o comparam a `auth.uid()`. Mesmo assim, o aplicativo só emite signed URLs após consultar `media_assets` pelo usuário da sessão e pelo status `ready`.

## Integridade e ciclo de vida

1. O servidor cria `media_assets` em `quarantine` e emite um caminho aleatório.
2. O upload termina no bucket privado.
3. Uma rotina autenticada verifica o arquivo real, decodifica, normaliza e muda o asset para `ready`.
4. O servidor cria ou atualiza `clothing_items` e grava a versão da análise.
5. Soft delete oculta a peça e bloqueia novos looks; limpeza posterior remove dados derivados conforme a política.

Um outfit guarda snapshot dos parâmetros da geração para ser auditável. Ele continua apontando para as peças; se uma peça ficar indisponível, o look histórico pode ser exibido como histórico, mas não pode ser recomendado novamente.

## Índices iniciais

- Todas as foreign keys, `owner_id` e `(owner_id, created_at desc)` em listas privadas.
- `clothing_items`: `(owner_id, availability)`, `(owner_id, category)`, `(owner_id, analysis_status)` e GIN para arrays somente se consultas reais justificarem.
- `outfits`: `(owner_id, created_at desc)`, `(owner_id, occasion, created_at desc)`.
- `outfit_items`: `(owner_id, clothing_item_id)` e `(clothing_item_id)` para impedir referências a peça indisponível.
- `media_assets`: `(owner_id, status, created_at desc)` e unique `(owner_id, sha256)` quando a política permitir deduplicação.
- `ai_usage`: `(owner_id, created_at desc)`, `(operation, created_at desc)` e unique global da chave idempotente.
- `webhook_events`: unique do evento externo e `(status, received_at)` para reprocessamento.

Índices extras serão adicionados por query observada, não por antecipação.

## Dados derivados, exportação e exclusão

Análise da IA, ranking, estatísticas e notificações são derivados. A conta pode solicitar exportação em JSON pelo endpoint privado `GET /api/private/account` e exclusão com confirmação de identidade. O job de exclusão deve invalidar sessão, remover referências, apagar objetos privados, cancelar tarefas e registrar somente um evento de auditoria sem conteúdo pessoal desnecessário.

### Referências

- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase — Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
