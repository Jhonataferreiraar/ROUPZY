# Produto

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Projeto existente em Next.js, React e PostgreSQL via Supabase, com deploy preparado para Vercel. A camada de domínio usa validação de schema onde há fronteira de dados sensível.

## Users

Pessoas no Brasil que têm um armário real, com peças que já possuem, e querem decidir o que vestir no celular ou no computador. Há também um proprietário do produto que opera um painel administrativo global separado para acompanhar usuários, uso, conteúdo, planos, integrações e auditoria.

## Product Purpose

Roupzy ajuda a pessoa a organizar fotografias das próprias roupas, confirmar os atributos reconhecidos e descobrir combinações para uma ocasião e uma vibe. O sucesso é a pessoa chegar com uma dúvida prática — “o que eu visto?” — e sair com opções reais feitas apenas com itens do próprio closet.

## Positioning

O produto parte do guarda-roupa existente em vez de empurrar referências de peças que a pessoa não tem. A recomendação nasce da combinação entre itens reais cadastrados, contexto do momento, preferências e histórico de uso; a IA auxilia na leitura e no ranqueamento, enquanto as regras do produto preservam a coerência e a origem das peças.

## Operating Context

O uso principal acontece antes de sair, ao organizar o armário ou ao avaliar uma inspiração externa. O fluxo recorrente é cadastrar uma peça por foto, revisar seus dados, consultar combinações, reagir a looks, favoritar e marcar o que foi usado. O proprietário usa a área administrativa em rotinas de acompanhamento, operação, configuração, governança, auditoria e saúde do serviço.

## Capabilities and Constraints

- Cadastro, login, confirmação de e-mail, recuperação de acesso, sessão, saída e exclusão de conta usam Supabase Auth.
- Closet, looks, inspirações, preferências, histórico, favoritos e arquivos são privados por usuário, com RLS e autorização server-side.
- Uploads usam storage privado, caminho por usuário, validação de tipo, tamanho, dimensões e conteúdo real, além de nomes gerados no servidor.
- A IA é acessada somente no servidor por uma camada `AIProvider` trocável. Respostas estruturadas são validadas e os atributos podem ser corrigidos manualmente.
- O Outfit Engine determinístico gera candidatos a partir do closet e a IA pode ranquear ou explicar resultados. O produto não exibe pontuações inventadas nem resultados simulados.
- O painel administrativo global é separado da área do cliente, exige autorização server-side e registra ações sensíveis em auditoria.
- A arquitetura de planos, limites, assinaturas, eventos e entitlements prepara billing real, sem declarar pagamento concluído sem um gateway conectado.
- A interface publicada é em português brasileiro, com datas, números, mensagens, moeda e acessibilidade localizados para `pt-BR`.
- O produto precisa funcionar bem em mobile e desktop, com foco visível, estados de carregamento, erro, vazio, desabilitado e sucesso.

## Brand Commitments

O nome confirmado é Roupzy. A voz é brasileira, direta, próxima e específica, com a moda como assunto e a tecnologia trabalhando nos bastidores. A experiência deve parecer um produto real, autoral, elegante, tecnológico e apresentável, com uma personalidade visual própria. Os sites e imagens citados no briefing são referências de qualidade e composição; código, identidade, textos e layouts não devem ser copiados.

## Evidence on Hand

Há um briefing de produto detalhado na conversa e uma implementação local funcional com rotas públicas, autenticação, área de cliente, área administrativa, Supabase, assets de marca e textos em português. Não há depoimentos, logos de clientes, métricas públicas ou resultados de uso fornecidos; essas provas não devem ser inventadas.

## Product Principles

- Começar pelo que a pessoa já tem.
- Fazer a decisão de vestir parecer simples, concreta e possível.
- Usar IA para perceber e organizar; preservar regras, controle e explicabilidade.
- Manter o espaço pessoal privado e o painel global operacionalmente separado.
- Transformar organização em descoberta, sem incentivar compra desnecessária.

## Accessibility & Inclusion

A interface deve atender WCAG 2.2 AA onde tecnicamente viável, manter contraste suficiente, foco de teclado, alvos de toque confortáveis, leitura responsiva, mensagens compreensíveis e suporte a `prefers-reduced-motion`. Cor nunca pode ser o único meio de comunicar estado.
