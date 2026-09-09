# Contrato de experiência — Roupzy

Este documento registra os comportamentos compartilhados do site, do espaço do cliente e do centro administrativo. A direção visual pertence ao `DESIGN.md`; este contrato define navegação, estados e respostas das interfaces.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
| --- | --- | --- | --- | --- |
| Navegação pública | `SiteHeader` e `SiteFooter` | `components/site-header.jsx`, `components/site-footer.jsx` | Cabeçalho amplo e menu móvel | Teclado, foco, fechamento, rotas e viewport móvel |
| Navegação do cliente | `AppShell` e `AppNavigation` | `components/app-shell.jsx`, `components/app-navigation.jsx` | Sidebar desktop e navegação compacta móvel | Rota ativa, rolagem, logout e páginas protegidas |
| Navegação administrativa | `AdminDashboardShell` | `components/admin-dashboard-shell.jsx` | Sidebar operacional e menu móvel | Permissão, rota ativa, logout e separação do cliente |
| Botões | Classes compartilhadas de ação | `app/roupzy-v3.css` | Primário, secundário, neutro e destrutivo | Hover, foco, ocupado, desabilitado e toque |
| Campos e validação | Formulário proprietário da operação | Componentes em `components/` e schemas de API | Campo de texto, senha, seleção, arquivo e textarea | `noValidate`, mensagem em pt-BR, erro associado e preservação de valor |
| Feedback assíncrono | Mensagem persistente próxima da ação | Componentes de formulário e painéis de controle | Status, erro e confirmação sensível | `role="status"`, `role="alert"`, tentativa repetida e sem dados fictícios |
| Conteúdo administrativo | Painéis de controle do admin | `components/admin-control-panel.jsx` e APIs `/api/admin/*` | Planos, configurações, flags, conteúdo, usuários e suporte | Autorização server-side, auditoria e estados vazios |
| Upload privado | Gerenciadores de closet e inspiração | `components/closet-manager.jsx`, `components/inspiration-manager.jsx` | JPG, PNG e WebP | Tipo, tamanho, estado de envio, erro e acesso privado |
| CRUD | Gerenciador do recurso e API correspondente | Componentes de domínio e rotas `/api/private/*` ou `/api/admin/*` | Criar, consultar, editar, arquivar e excluir conforme permissão | Autorização, confirmação sensível, atualização da lista e auditoria |
| Date | Entrada nativa e formatador `pt-BR` | Campo `type="date"` e `Intl.DateTimeFormat('pt-BR')` | Data única e exibição de data/hora | Teclado, valor vazio, fuso horário e formato brasileiro |
| Form | Componente proprietário de cada operação | Componentes em `components/` | Autenticação, cadastro, filtros, edição e confirmação | `noValidate`, labels, foco, erro, ocupado e envio único |
| Scrollbar | Documento e contêiner rolável local | `app/roupzy-v3.css` | Página, lista, tabela e navegação compacta | Visibilidade, teclado, touch e ausência de bloqueio vertical |
| Select/Listbox | `select` HTML nativo | Formulário proprietário da operação | Escolha simples e filtro administrativo | Label, foco, teclado, opção atual e popup do sistema |

## Superfícies e acesso

- O site público usa navegação institucional curta e leva cadastro e entrada para fluxos próprios.
- O espaço do cliente vive exclusivamente em `/app` e exige uma sessão Supabase válida.
- O centro administrativo vive exclusivamente em `/admin`, exige papel administrativo no servidor e nunca compartilha navegação com o cliente.
- Uma sessão válida sem autorização administrativa recebe uma explicação de acesso negado no fluxo administrativo.

## Operações e navegação

- Criação concluída retorna para a lista que possui o recurso, preservando o contexto sempre que o fluxo permitir.
- Edições permanecem na página atual e confirmam o resultado perto do controle alterado.
- Falhas preservam os valores não sensíveis e oferecem uma ação clara para tentar novamente.
- Exclusão, bloqueio, suspensão, mudança de permissão e outras ações sensíveis exigem confirmação própria do produto.
- O botão principal mantém o mesmo tamanho durante carregamento e impede envio duplicado.

## Formulários

- Formulários usam `noValidate` e mensagens em português brasileiro.
- Campos têm rótulo visível, erro associado e foco no primeiro campo inválido.
- Senhas permanecem mascaradas por padrão e têm controle acessível para exibir ou ocultar.
- `select` nativo é o proprietário canônico para escolhas simples; o popup do sistema operacional é aceito nesta versão.
- Datas usam entrada tipada ou nativa quando a geometria do calendário não faz parte da experiência principal.
- Textareas não podem ser redimensionadas manualmente e recebem altura suficiente para a tarefa.

## Busca, filtros e conjuntos de dados

- Buscas locais atualizam imediatamente e sempre oferecem um botão próprio para limpar quando houver texto.
- Buscas remotas usam atraso de 300 ms, cancelamento de requisição anterior e proteção durante composição de texto.
- Filtros, ordenação e paginação administrativas devem ser refletidos na URL quando forem a visão principal da página.
- Tabelas administrativas usam paginação no servidor. Catálogos pessoais usam carregamento explícito quando crescerem além do limite da página.
- Estado vazio e nenhum resultado são mensagens diferentes; nenhum resultado oferece limpeza dos filtros.

## Feedback e resiliência

- Mensagens persistentes próximas da operação são o sistema canônico atual de feedback.
- Alertas de erro usam `role="alert"`; confirmações e atualizações não urgentes usam região de status.
- Dados reais não são substituídos por números fictícios quando uma integração falha.
- Integrações indisponíveis mostram o que falta configurar sem expor chaves, tokens ou detalhes internos.
- Carregamentos preservam a geometria da tela e rotas protegidas têm estados próprios de carregamento e erro.

## Acessibilidade e idioma

- Toda a interface publicada usa `pt-BR`, datas brasileiras e moeda BRL quando aplicável.
- O alvo é WCAG 2.2 AA, com semântica nativa, foco visível, contraste adequado e operação por teclado.
- Alvos principais de toque têm pelo menos 44 px sempre que o espaço permitir.
- Movimento respeita `prefers-reduced-motion`.
- O documento mantém scrollbars visíveis e consistentes em todas as superfícies controladas pelo produto.
