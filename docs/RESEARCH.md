# Pesquisa — Roupzy

Data: 6 de setembro de 2026. Fase 1 concluída; revisão humana pendente.

Este documento registra pesquisa e decisões propostas, não funcionalidades implementadas. A fase 2 não foi iniciada. Não há aplicação, banco, integração, pagamento ou teste de isolamento executado nesta etapa.

## 1. Escopo e integridade do ambiente

Diretório autorizado de escrita: `C:\Users\ferre\OneDrive\Documentos\Projeto GR Inteligente`.

As referências `C:\Users\ferre\OneDrive\Documentos\claude-cookbooks-main` e `C:\Users\ferre\OneDrive\Documentos\Projeto de Afiliado` foram acessadas somente para leitura. Nenhum script dessas referências foi executado ou importado. Nenhuma dependência foi instalada. Arquivos `.env` reais, bases privadas e credenciais não foram abertos. Do `.env.example` foram extraídos apenas nomes de variáveis.

A pasta de destino estava vazia na inspeção inicial, sem AGENTS.md encontrado na busca. Foi verificado que a raiz não é um redirecionamento de filesystem. O caminho do relatório foi validado antes da gravação. A pasta com o nome antigo mencionada no histórico não foi utilizada.

O histórico Git do projeto de afiliados foi consultado com exceção de propriedade restrita ao comando, sem alterar configuração global. Commits observados: `4b3866e`, `c8b59ea`, `3b66167`. São evidência de manutenção de integrações, não certificação de qualidade ou segurança.

## 2. Síntese da pesquisa

A proposta permanece: descobrir o que vestir usando as roupas que a pessoa já possui. O principal requisito de confiança é que cada peça recomendada exista, pertença à pessoa autenticada e esteja disponível para uso.

A direção proposta combina apresentação editorial de moda, cadastro fácil de corrigir e recomendações verificáveis. IA deve reduzir trabalho; a organização, as permissões e a validade das combinações ficam sob regras controladas pelo sistema.

O primeiro ciclo de valor é: cadastro → foto → atributos sugeridos → confirmação → closet → ocasião e vibe → até três combinações válidas → feedback e registro de uso. Dez peças são uma meta de onboarding, não garantia matemática de três looks distintos.

## 3. Referências locais: o que aproveitar e o que evitar

### Claude Cookbooks

Leituras: `README.md`, `pyproject.toml`, trechos de `tests/notebook_tests/test_notebooks.py` e células explicativas de `multimodal/best_practices_for_vision.ipynb`, `tool_use/extracting_structured_json.ipynb` e `misc/building_evals.ipynb`.

Aprendizados:

- Organizar operações de IA por responsabilidade e manter exemplos e avaliações próximos dos contratos.
- Usar conjuntos de entrada, respostas de referência e critérios de avaliação explícitos; validar por código sempre que houver uma regra objetiva.
- Tratar interpretação visual como falível. Categoria, cor e estampa devem ser corrigíveis pelo usuário.
- Resposta estruturada é uma interface de dados; não comprova que a análise corresponde à imagem.
- Separar validação estrutural, detecção de segredos e execução de testes.

Não transportar exceções educacionais para produção. O `pyproject.toml` contém dispensas de regras de segurança para demonstrações, incluindo construção de SQL e uso de pickle. Não copiar essas dispensas, notebooks, prompts ou dependências para o SaaS. A leitura foi amostral, não uma auditoria completa do repositório.

### Projeto de Afiliado

Leituras: `package.json`, `server/auth.js`, início de `server/store.js`, trechos e pontos de integração de `server/ai.js`, controles de limite e rotas em `server/index.js`, início de `scripts/test-security.mjs`, nomes de configuração e histórico Git.

| Evidência observada | Aplicação ao novo produto |
| --- | --- |
| React, módulos ES, servidor Express e Vite | Aproveitar separação de responsabilidades; manter Next.js solicitado para o novo projeto |
| Cookies com HttpOnly, SameSite, Secure e verificação CSRF | Preservar objetivos de proteção; autenticação será Supabase Auth |
| Sessão assinada própria e autorização administrativa | Não transplantar: o SaaS exige identidade individual, bloqueio e papéis restritos |
| Persistência em `db.json` e chaves locais | Não usar como banco SaaS; PostgreSQL com transações, RLS e migrations |
| Contadores de tentativas em Map | Não usar como limite confiável entre instâncias; definir persistência e incrementos atômicos |
| Integrações com provedores e timeout | Projetar AIProvider com contratos por operação, orçamento e falhas explícitas |
| Testes HTTP de cookies, CSRF, exposição de configuração e admin | Reaproveitar categorias de teste, acrescentando isolamento entre dois usuários |
| Configuração de marca e conteúdo concentrada | Adotar configuração validada e separar campos públicos, administrativos e secrets |

Não foram executados os testes: eles inicializam servidor e escrevem dados temporários. A leitura não permite afirmar que o projeto de referência está seguro ou inseguro como um todo. Também não fornece evidência de isolamento multiusuário aplicável ao novo produto.

## 4. Referências visuais e identidade própria

### Hering

Fonte: [página inicial da Hering](https://www.hering.com.br/), consultada por leitura textual e captura do navegador em desktop.

Observado: fotografia de campanha ocupando grande área, aproximação de tecidos, títulos grandes e contraste entre pessoa vestindo a peça e detalhe do produto. O cabeçalho, as promoções e sobreposições competem com a fotografia no estado capturado.

Aplicar como interpretação própria: fotografia com textura e luz natural, hierarquia editorial e roupas como centro da composição. Evitar reproduzir campanhas, logotipo, textos, contagem regressiva, sobreposições promocionais e transparências. A primeira tela já oferece aprendizados suficientes sem copiar seu layout.

Limitação: a captura da Hering após ajuste de viewport permaneceu em desktop; não foi validado seu comportamento mobile. Isso não é evidência de defeito do site.

### Acloset

Fonte: [página em português do Acloset](https://www.acloset.app/pt/), inspecionada no navegador em desktop e com viewport solicitado de 390 × 844. O acesso por extração web falhou inicialmente, mas a página abriu no navegador.

Observado: proposta de valor e telas do produto lado a lado no desktop; no celular, título, explicação, chamadas e imagens são empilhados. As imagens mostram catálogo de peças e composição de looks. A página apresenta digitalização, sugestões, calendário e estatísticas.

Aplicar: mostrar como as peças da própria pessoa se tornam looks e explicar o fluxo em passos curtos. Priorizar a ação principal e antecipar demonstração útil no celular. Não importar números de usuários, depoimentos, percentuais, badges, marcas ou promessas de acurácia. As métricas promocionais da referência não foram verificadas independentemente.

### Direção proposta para aprovação

Conceito editorial: um guarda-roupa pessoal bem cuidado, com tecnologia discreta. Nome comercial definido para a fase de site: Roupzy. A disponibilidade jurídica, de domínio e de registro de marca ainda precisa ser validada antes do lançamento.

- Paleta: fundo marfim, texto carvão, superfícies claras e acento terracota ou oliva escuro. São direções; valores e contrastes serão definidos na fase 2.
- Tipografia: títulos com caráter editorial e texto funcional muito legível. Escolher famílias e licenças na arquitetura; limitar variantes e carregamento.
- Composição: espaço em branco intencional, recortes de roupas consistentes e fotografia de autoria própria ou licenciada.
- Componentes: bordas discretas, poucos raios e sombras, estados de foco evidentes e ações descritas em linguagem cotidiana.
- Mobile: closet em grade ajustável, fotografar/adicionar facilmente acessível, correção por peça e estados claros de upload, análise e falha.
- Inclusão: recomendações baseadas nas preferências informadas, sem exigir gênero, foto do corpo ou inferir atributos pessoais sensíveis.

Antes de qualquer tela, produzir tokens de cores semânticas, tipografia, espaçamento, medidas, radius, sombras, foco, erro, sucesso, loading e movimento reduzido. Nenhuma tela ou design system foi implementado nesta fase.

## 5. Decisões técnicas propostas

### Linguagem e limites entre camadas

Manter Next.js, React, Supabase e Vercel. Propor JavaScript/JSX na apresentação e TypeScript nas camadas de domínio, contratos, banco, autorização, IA e billing. Zod nas fronteiras continua obrigatório mesmo com tipos estáticos. Confirmar versões estáveis e vulnerabilidades na fundação, sem copiar versões das referências.

Uma camada de acesso a dados executada no servidor deve verificar identidade e propriedade e devolver apenas os campos necessários. É coerente com a [orientação oficial de segurança do Next.js](https://nextjs.org/docs/app/guides/data-security). Cada operação privada precisa dessas verificações; ocultar um botão ou proteger só o layout não resolve autorização.

### Autenticação e privacidade

A [documentação SSR do Supabase](https://supabase.com/docs/guides/auth/server-side/advanced-guide) descreve compartilhamento de tokens entre cliente e servidor e alerta para riscos de cache de respostas de sessão.

Para cumprir o requisito do produto de cookies de sessão HttpOnly, propor acesso autenticado pelo backend: navegador chama Next.js, servidor gerencia sessão Supabase e usa o token da pessoa nas operações sujeitas a RLS. Validar na fase 2 login, renovação concorrente, confirmação, recuperação, logout e revogação; não assumir que o cliente Supabase padrão no navegador atende esse contrato.

Clientes de banco autenticados devem ser criados por requisição. Respostas privadas e de autenticação não devem entrar em cache público. Service Role fica restrita a tarefas privilegiadas específicas, nunca ao CRUD normal do closet.

RLS deve proteger também tabelas associativas. Não basta possuir o outfit: suas peças também precisam pertencer ao mesmo dono. Planejar integridade relacional para impedir vínculos entre usuários. A documentação de [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) e de [controle do Storage](https://supabase.com/docs/guides/storage/security/access-control) será base para políticas e testes, não substituto dos testes.

### Fotos e processamento

A [Vercel documenta limite de 4,5 MB por payload de função](https://vercel.com/docs/functions/limitations). Portanto, não prometer aceitar qualquer foto enviando o original diretamente por uma rota Next.js.

Propor upload autorizado para uma área privada de quarentena no Supabase, com nome e caminho emitidos pelo servidor, limite de tamanho e validade curta. O servidor deve verificar propriedade, assinatura do arquivo, formato, dimensão e decodificação antes da promoção para o closet. O fluxo definitivo de processamento e seus limites serão comparados na fase 2.

Reencodar imagem validada e retirar metadados desnecessários; rejeitar formatos ativos. Não disponibilizar original não validado como foto do closet. Cotas, limpeza de órfãos, expiração de quarentena e custo de downloads precisam de definição. Remover o fundo não pode alterar cor, corte ou estampa da roupa; não faz parte de uma promessa já implementada.

URLs assinadas são credenciais temporárias de acesso: não guardar em logs, analytics ou cache público. Para recursos que exijam revogação imediata, estudar entrega autenticada em vez de depender apenas da expiração de URL.

### IA e Outfit Engine

Projetar `analyzeClothing`, `analyzeInspiration`, `rankOutfits` e `explainOutfit`. Gemini econômico é candidato inicial; modelo exato, disponibilidade, condições de processamento e custo permanecem pendentes de validação.

[Saída estruturada do Gemini](https://ai.google.dev/gemini-api/docs/structured-output) serve como mecanismo de contrato. Acrescentar validação de categorias, limites, IDs autorizados e valores desconhecidos. Conteúdo de imagens e textos externos é entrada não confiável, nunca instrução operacional para o sistema.

Persistir análise por versão da imagem, contrato e modelo, com idempotência por usuário. Correções manuais prevalecem; não reanalisar ao gerar looks. Registrar operação, modelo, tokens quando fornecidos, estimativa de custo identificada como estimativa, duração e resultado. Ausência de medição não vira custo zero.

O motor gera candidatos apenas com peças do usuário, valida composição e disponibilidade, aplica regras e diversifica resultados. A IA pode ordenar candidatos e explicar escolhas, mas não criar IDs nem inserir peças externas. Se houver menos de três combinações válidas, mostrar o resultado real e explicar o que falta. Na indisponibilidade da IA, manter ranking determinístico e explicação baseada em regras, claramente sem atribuição falsa à IA.

### Administração, limites e cobrança

Papéis administrativos não editáveis pelo próprio usuário; ações sensíveis auditadas e autorizadas no servidor. Métricas operacionais agregadas por padrão, sem galeria irrestrita de fotos privadas.

Cotas de IA e planos precisam de reserva e consumo atômicos, inclusive sob concorrência. Selecionar na arquitetura mecanismo de rate limiting compartilhado e estratégia de falha. Cobrança depende de provedor real, assinatura de webhook e idempotência; planos ainda não possuem preços aprovados. Páginas públicas devem refletir o estado comercial real, sem botões que simulem assinatura concluída.

## 6. Riscos e critérios verificáveis

| Risco | Critério que deverá ser provado |
| --- | --- |
| Acesso entre usuários | B não lê, altera, remove ou vincula recursos de A, inclusive via API direta do banco e Storage |
| Escalada de privilégios | Cookie, payload, UUID e metadados editáveis não concedem admin nem plano |
| Vazamento de sessão | Duas sessões simultâneas nunca recebem dados, cookies ou cache uma da outra |
| Upload enganoso | Extensão falsa, MIME divergente, arquivo inválido e imagem excessiva são rejeitados sem chegar ao closet |
| Custo descontrolado | Repetição e concorrência não duplicam análise nem ultrapassam cotas aprovadas |
| Look inventado | Todos os IDs existem no closet correto e obedecem às regras obrigatórias |
| Resultado vazio | Closet pequeno ou combinações insuficientes produzem estado honesto, sem roupas fictícias |
| Admin excessivo | Operador vê somente os dados necessários; mutações sensíveis deixam trilha segura |
| Exclusão incompleta | Processo cobre banco, objetos, sessões e tarefas pendentes, com política explícita para backups |
| Interface inadequada | Revisão mobile, teclado, contraste e estados antes do aceite; Lighthouse medido em build real |

Testes de isolamento entram junto das primeiras tabelas e operações. A fase 14 amplia ataques e revisão; não é a primeira ocasião para testar segurança. Metas Lighthouse são critérios futuros, não resultados obtidos.

## 7. Questões a resolver nas fases seguintes

- Fase 2: modelo relacional das 22 entidades mínimas, propriedade de relacionamentos, regras de bloqueio, contratos, esquema de tokens, pastas, uploads, jobs e autenticação HttpOnly.
- Antes da fundação: versões e compatibilidade, ambientes separados, política de configuração e forma de fornecer credenciais sem incluí-las no chat ou repositório.
- Antes de recursos pagos: gateway, preços, quotas, custo esperado por usuário, webhooks e política de inadimplência.
- Antes de publicação: marca, domínio, identidade do responsável, contato real, fotos licenciadas e conteúdo institucional revisado.
- Antes de produção com dados reais: condições dos fornecedores de IA, retenção, regiões, exportação, exclusão, backup/restauração e revisão dos documentos de privacidade.

Não foram feitas alegações de conformidade jurídica ou estimativas financeiras. Os temas acima são decisões de produto e engenharia pendentes.

## 8. Checkpoint humano

Pesquisa local e visual realizada; decisões propostas registradas. A abrangência foi amostral e as limitações foram explicitadas. Não houve escrita nas referências, cópia de código, criação de telas ou integração externa.

Aprovar ou ajustar a direção editorial e a proposta técnica antes da fase 2. A próxima fase produzirá arquitetura, modelo de dados, contratos, estratégia de segurança, estrutura de pastas e design tokens, ainda antes da inicialização da aplicação na fase 3.
