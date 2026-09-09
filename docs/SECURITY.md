# Segurança — Roupzy

Status: controles centrais implementados no MVP. O hardening ativo e os testes de ataque continuam obrigatórios antes de produção.

## Modelo de ameaça

O sistema trata fotos, preferências, histórico de uso e conta como dados pessoais. As ameaças prioritárias são:

- usuário autenticado manipulando UUID, `owner_id`, plano ou papel para acessar outra conta;
- cliente tentando ler ou gravar diretamente uma tabela, vínculo ou objeto de Storage;
- arquivo com extensão/MIME falso, conteúdo inválido ou tamanho que provoque custo ou indisponibilidade;
- prompt ou imagem externa tentando induzir o modelo a gerar instruções ou dados que não pertencem ao usuário;
- abuso de login, upload, IA, contato, reset e webhook;
- cache, log, bundle ou mensagem de erro expondo sessão, secret ou conteúdo privado;
- operador administrativo recebendo acesso amplo sem necessidade ou sem trilha;
- webhook repetido, forjado ou fora de ordem alterando assinatura e entitlement.

O objetivo de segurança é reduzir probabilidade e impacto, com RLS, autorização server-side, validação, minimização, expiração e auditoria combinadas. Um botão oculto ou um UUID difícil de adivinhar não é controle suficiente.

## Autenticação e sessão

Supabase Auth é a fonte de identidade. O produto terá cadastro, confirmação de email, login, logout, recuperação e redefinição de senha, bloqueio e exclusão. O fluxo web usa PKCE e integração SSR.

Regras:

- não armazenar senha em tabela própria;
- validar sessão no servidor e renovar cookies de forma segura;
- usar cookies `Secure` em produção, `HttpOnly` obrigatoriamente, `SameSite=Lax` ou mais restrito e escopo de caminho mínimo;
- respostas que tocam sessão usam `Cache-Control: private, no-store`;
- não confiar em `localStorage`, cookie editável, claims não verificados ou campos enviados pelo formulário para papel, plano ou propriedade;
- reset e confirmação não revelam se um email existe além da mensagem uniforme definida pelo produto;
- invalidar sessões quando a política de bloqueio ou exclusão exigir.

O teste de sessão terá duas contas em navegadores isolados e verificará que cookies, cache, exportações e DTOs nunca atravessam a fronteira. O navegador não terá acesso de leitura aos tokens de sessão.

## Autorização e RLS

Cada caso de uso segue esta ordem:

1. validar schema e tamanho do input;
2. obter usuário atual no servidor;
3. negar conta bloqueada;
4. carregar recurso filtrando pelo usuário, nunca por UUID isolado;
5. validar papel, entitlement e estado;
6. executar mutação transacional;
7. registrar auditoria se for sensível;
8. devolver DTO mínimo.

RLS fica habilitado para todas as tabelas privadas, inclusive `outfit_items`, feedback, histórico, preferências, inspiração, uso e notificações. O service role só é usado em rotinas server-side explicitamente separadas e nunca como atalho para o CRUD de uma pessoa.

O admin tem duas barreiras: papel ativo consultado no banco e autorização específica da operação. Ver fotos ou dados de conteúdo não é implícito em ser admin; a interface e o caso de uso devem solicitar o mínimo necessário.

## Storage e upload

Buckets são privados. O caminho é emitido pelo servidor como `user_uuid/random_id/asset_version.ext`; o nome original não vira caminho. A URL assinada é curta, não é logada e só é criada depois de confirmar dono e status.

Pipeline obrigatório:

- aceitar apenas tipos definidos, com limite de bytes e dimensões;
- comparar extensão declarada, MIME declarado e assinatura real;
- decodificar com biblioteca de imagem segura;
- rejeitar conteúdo inválido, formatos ativos e dimensões que provoquem consumo anormal;
- reencodar para formato aprovado, remover metadados que não são necessários e calcular hash;
- promover de `quarantine` para `ready` somente após a validação;
- expirar e limpar uploads órfãos;
- verificar que o objeto persistido pertence à conta antes de análise ou exibição.

O limite de payload da função não será contornado aumentando indiscriminadamente a rota. O upload direto assinado reduz o corpo enviado à aplicação; o processamento permanece controlado.

## Headers e navegador

Na fundação, aplicar pelo menos:

- CSP com fontes, imagens e conexões allowlisted;
- `Strict-Transport-Security` somente em HTTPS de produção;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `Permissions-Policy` fechando câmera, microfone e geolocalização por padrão;
- `frame-ancestors 'none'` e proteção equivalente contra clickjacking;
- remoção do header de tecnologia desnecessário;
- origem permitida e proteção CSRF para mutações baseadas em cookie.

Inline scripts e HTML fornecido pelo usuário são proibidos por padrão. Texto vindo de feedback, inspiração, nome de peça e resposta de IA é renderizado como texto escapado. URLs externas passam por schema e allowlist quando houver navegação.

## IA e conteúdo não confiável

Imagem de inspiração, URL e texto do usuário são dados. Não podem alterar system prompt, chamar ferramentas, escolher outros IDs, revelar secrets ou produzir uma mutação diretamente. O resultado do modelo é candidato não confiável e passa por schema, enums, limites, validação de IDs e regras do domínio.

Nenhum prompt inclui dados além do necessário. Não enviar histórico completo, email, token, caminho de Storage ou dados de outra conta. O provedor, retenção e região serão aprovados antes de processar dados reais.

## Rate limit, abuso e custos

Os limites são separados por operação e, quando aplicável, por usuário autenticado e IP anonimizado:

- login, cadastro, reset e confirmação: janela curta e resposta uniforme;
- upload: bytes, arquivos por janela e concorrência;
- análise de peça/inspiração e geração de look: quota de plano mais limite operacional;
- contato e feedback: janela por origem e conta;
- admin e webhooks: autenticação forte, assinatura e limite de abuso.

O armazenamento do limite precisa ser compartilhado ou transacional. A memória da instância não é fonte de verdade. Quota de IA usa reserva atômica, consumo ou liberação em caso de falha e uma chave idempotente.

## Segredos e logs

Secrets ficam em variáveis server-side do ambiente de deploy. Nenhuma chave de IA, service role, assinatura de webhook ou token privado possui prefixo público ou aparece no código enviado ao browser.

Logs redigem emails quando não necessários, IDs de sessão, signed URLs, cabeçalhos de autorização, imagens, prompts e corpos de webhook. Erros do cliente são códigos e mensagens compreensíveis; stack trace, SQL, path e segredo ficam apenas em observabilidade protegida.

## Auditoria administrativa

Auditar concessão ou revogação de papel, bloqueio, alteração de plano, alteração de configuração, reprocessamento de IA, acesso excepcional a conteúdo e ações de billing. Cada evento contém ator, papel no momento, ação, recurso, resultado, request id e timestamp. Nunca armazenar senha, token, API key ou cópia desnecessária da imagem.

`audit_logs` é append-only para o aplicativo. Exportação e retenção serão definidas com a política de privacidade e a necessidade operacional.

## Matriz mínima de verificação

| Área | Cenário | Resultado exigido |
| --- | --- | --- |
| Closet | B troca UUID de uma peça de A | 404/403 sem leitura ou mudança |
| Looks | B envia `outfit_item` apontando para peça de A | transação recusada |
| Storage | B tenta assinar ou abrir caminho de A | sem URL utilizável |
| Preferências | B altera `owner_id` ou payload oculto | dono permanece B e campos proibidos são rejeitados |
| Admin | usuário altera cookie, localStorage ou body para virar admin | 401/403 |
| Billing | cliente define plano pago ou entitlement | sem efeito sem evento verificado |
| IA | resposta contém ID externo ou campo inesperado | schema/dominio rejeita e registra falha segura |
| Upload | arquivo falso, inválido, enorme ou ativo | quarentena rejeitada e objeto limpo |
| XSS | nome, feedback, URL e explicação contêm HTML/script | texto escapado, sem execução |
| Limite | duas requisições concorrentes consomem a última cota | apenas uma reserva válida |
| Sessão | cache ou prefetch alterna duas contas | nenhuma resposta cruzada |

O teste negativo deve chamar as rotas e, quando possível, o banco com um usuário distinto. O teste não deve depender apenas da aparência da UI.

### Referências

- [Next.js — Data Security](https://nextjs.org/docs/app/guides/data-security)
- [Supabase — SSR Auth advanced guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide)
- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase — Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
