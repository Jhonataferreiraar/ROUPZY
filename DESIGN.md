version: 1.0
name: "Roupzy"
description: "Sistema brasileiro de guarda-roupa pessoal que transforma peças reais em possibilidades de vestir, com uma interface tecnológica, viva e própria."
colors:
  void: "#070917"
  deep: "#0B1024"
  panel: "#10183A"
  panel-strong: "#172555"
  white: "#F7F9FF"
  muted: "#9EA9CC"
  faint: "#6F7BA5"
  line: "rgb(164 181 255 / 24%)"
  line-strong: "rgb(164 181 255 / 44%)"
  blue: "#5666FF"
  blue-deep: "#3041D5"
  cyan: "#91EEFF"
  lime: "#D9FF63"
  coral: "#FF665B"
  green: "#6CE2A9"
typography:
  display:
    fontFamily: "'Roupzy Display', 'Space Grotesk', 'Segoe UI', sans-serif"
    fontSize: "clamp(48px, 7vw, 88px)"
    lineHeight: "0.93"
  body:
    fontFamily: "'Roupzy Sans', 'Manrope', 'Segoe UI', Arial, sans-serif"
    fontSize: "15px"
    lineHeight: "1.6"
  utility:
    fontFamily: "'Roupzy Sans', 'Manrope', 'Segoe UI', Arial, sans-serif"
    fontSize: "10px"
    lineHeight: "1.25"
rounded:
  small: "10px"
  default: "16px"
  large: "24px"
spacing:
  page-gutter: "clamp(20px, 4vw, 64px)"
  content-max: "1240px"
  control-height: "46px"
  section-padding: "clamp(88px, 10vw, 148px)"
components:
  public-header:
    surface: "void"
    border: "line"
    navigation: "compact command bar with a clear primary action"
  primary-button:
    surface: "blue"
    text: "white"
    radius: "small"
    height: "46px"
  archive-board:
    surface: "panel over a technical grid"
    border: "line-strong"
    accent: "cyan, lime and coral signal layers"
  context-card:
    surface: "blue"
    text: "white"
    accent: "lime"
  client-shell:
    surface: "deep"
    navigation: "operational rail with a dedicated mobile drawer"
  admin-shell:
    surface: "void"
    navigation: "global owner command center, separate from client"
  data-surface:
    surface: "panel"
    border: "line"
    radius: "default"
---

# Roupzy Design System

## North star

**Sistema vivo de curadoria.** O Roupzy é apresentado como uma ferramenta que lê o armário de uma pessoa e converte essa leitura em possibilidades concretas. A interface pública parece um console visual em movimento: grades, órbitas, sinais, camadas e fichas digitais de peças. Na área do cliente, a mesma ideia vira uma central de operação para organizar, escolher e acompanhar. No admin global, ela vira um centro de comando com linguagem própria de produto operacional.

Essa direção troca o aspecto de template SaaS e a aparência rústica/editorial por uma identidade tecnológica reconhecível. O sistema deve parecer construído para o problema de vestir com peças existentes, e cada detalhe visual precisa ajudar a pessoa a localizar, entender ou decidir.

## Product context

- **Público:** pessoas no Brasil com um armário real e o proprietário do produto, que usa uma área administrativa global separada.
- **Tarefa principal:** cadastrar peças, confirmar atributos e encontrar possibilidades de look usando somente as peças da própria pessoa.
- **Canais:** web responsiva, com uso recorrente no celular e no desktop.
- **Idioma:** português brasileiro em todas as rotas públicas, autenticação, cliente e admin. Datas, números e moeda usam `pt-BR`.
- **Registro:** marca pública tecnológica e convidativa; cliente claro e orientado à ação; admin denso, legível e operacional.
- **Provas permitidas:** somente dados reais do produto. Não criar depoimentos, logos, contagens de usuários ou métricas de uso fictícias.

## Visual language

A base usa azul quase preto e painéis profundos para criar a sensação de um sistema em operação. Branco frio ancora a leitura. Azul elétrico marca ação e descoberta; ciano marca leitura e foco; lime marca confirmação e energia; coral marca decisão, contexto ou atenção; verde comunica operação pronta. As cores são acompanhadas por texto, posição, borda ou sinal para que não sejam o único meio de comunicação.

Grades finas, órbitas, linhas de varredura, painéis de sinal e sombras deslocadas constroem profundidade sem usar glassmorphism. O visual não usa gradientes genéricos, blobs, dashboard cinza corporativo, cartões aninhados sem função ou iconografia de robô/IA. Brilho só aparece como sinal controlado em pontos de atenção, nunca como decoração espalhada.

## Tokens and ownership

`app/roupzy-tech.css` é a camada visual canônica da reconstrução e é importada por último em `app/layout.jsx`. Ela contém os tokens `--rt-*` e os overrides tecnológicos para as superfícies públicas, autenticação, cliente e admin. `app/roupzy-impeccable.css` continua como base de compatibilidade para componentes compartilhados; novas decisões de identidade devem entrar na camada tecnológica ou nos componentes que a alimentam.

Os tokens principais são:

- **Superfícies:** `--rt-void`, `--rt-deep`, `--rt-panel`, `--rt-panel-strong`.
- **Texto e linhas:** `--rt-white`, `--rt-muted`, `--rt-faint`, `--rt-line`, `--rt-line-strong`.
- **Sinais:** `--rt-blue`, `--rt-blue-deep`, `--rt-cyan`, `--rt-lime`, `--rt-coral`, `--rt-green`.
- **Tipografia:** `--rt-display` para títulos e números de destaque; `--rt-body` para corpo, interface e tabelas.
- **Profundidade:** `--rt-shadow-blue` e `--rt-shadow-coral` para deslocamentos gráficos pontuais.

Valores novos devem usar tokens ou uma composição de `clamp()` baseada neles. Valores isolados só são aceitáveis quando definem uma geometria interna de ilustração, um recorte de imagem ou uma correção responsiva específica.

## Typography

`Roupzy Display` dá personalidade aos títulos, números e nomes de seções. `Roupzy Sans` mantém leitura e operação. Títulos usam tracking negativo moderado e altura de linha curta, sem esmagar palavras. Corpo usa medida confortável e altura entre 1.6 e 1.85 em textos longos. Labels utilitários podem usar caixa alta e espaçamento positivo, mas devem permanecer curtos. Ciano e lime podem destacar trechos curtos, sem substituir a hierarquia tipográfica.

O título de maior destaque pode chegar a 88px em desktop e fica entre 44px e 52px em telas estreitas. O texto de interface parte de 11px para utilitários e 13px–15px para leitura. Nenhum texto importante depende de uma fonte externa para carregar corretamente: há fontes auto-hospedadas e fallbacks.

## Layout

O site público começa com uma hero de duas colunas: texto e um console visual com fichas, órbitas e sinais de peças. As seções alternam void, painéis profundos, azul elétrico e lime para criar ritmo de página longa. A navegação é curta e a ação principal fica sempre visível no cabeçalho. Páginas internas reutilizam a grade, os painéis, as linhas de sinal e o conteúdo limitado.

A área do cliente tem shell próprio com navegação lateral no desktop, topo de contexto e conteúdo rolável sem altura presa. No mobile, a navegação vira um drawer acessível, com conteúdo livre para rolar até o fim. O admin tem shell visual separado, rail escuro, grupos de navegação próprios e superfícies de dados escuras. Cliente e admin nunca compartilham a mesma navegação.

O container padrão tem no máximo 1240px e gutter fluido. Grelhas de conteúdo refluem em 1050px, 820px e 560px. Toda ação importante tem alvo confortável e pode receber foco pelo teclado.

## Components and states

- **Botões:** verbo explícito mais seta CSS opcional. Ação primária azul sólida; secundária com borda; destrutiva separada e acompanhada de confirmação. Altura mínima de 46px.
- **Links:** sublinhado de interação aparece no hover/foco; não há links importantes apresentados somente como uma seta.
- **Fichas e superfícies:** borda visível, hierarquia por espaço e contraste, sombra curta somente quando a superfície estiver deslocada do painel.
- **Formulários:** label visível, placeholder auxiliar, erro próximo do campo, foco com contorno e estado ocupado que preserve a geometria.
- **Tabelas e listas:** cabeçalho, valor, contexto temporal e ação legível. Em telas pequenas, linhas viram blocos ou rolagem local.
- **Vazio:** explica o que falta e oferece a próxima ação concreta, como `Cadastrar primeira peça`.
- **Erro:** texto de produto claro; detalhes técnicos permanecem no log seguro.
- **Admin:** qualquer ação sensível informa alvo, efeito e resultado; eventos ficam localizados e auditáveis.

## Iconography

O sistema usa formas CSS simples e o monograma R da marca para setas, pontos de sinal, estados e ações auxiliares. Símbolos decorativos não substituem texto. Não usar emoji, glifos Unicode ou ícones de pacote como atalho visual para uma ação importante. Quando uma ação é universal, o ícone continua acompanhado de label ou nome acessível.

## Motion

Animação comunica que o sistema está lendo, conectando e atualizando possibilidades. Órbitas e pontos de sinal criam a presença do motor; uma linha de varredura passa pelo console principal; fichas flutuam poucos pixels para sugerir camadas vivas; a demonstração troca o contexto com uma transição curta. Interações usam 160–240ms; entradas de conteúdo ficam abaixo de 420ms. Movimento usa `transform` e `opacity` para preservar desempenho e não deslocar o layout. Ações continuam compreensíveis sem movimento. Com `prefers-reduced-motion`, animações contínuas são removidas e transições ficam quase instantâneas.

## Accessibility and performance

Contraste, foco visível, labels e mensagens anunciáveis são parte da estética. A interface não deve depender de hover. O conteúdo precisa continuar navegável com teclado e toque. Imagens têm dimensões reservadas e `object-fit` controlado; fontes são auto-hospedadas; não carregar recursos decorativos externos. A meta é manter Lighthouse acima de 90 em performance e 95 em acessibilidade, boas práticas e SEO quando a integração real permitir.

## Do and don't

- **Faça:** use o vocabulário de sistema, peça, contexto, leitura e escolha.
- **Faça:** deixe o dado e a ação perto um do outro.
- **Faça:** use sinais, camadas e movimento para tornar a curadoria real do Roupzy visível.
- **Não faça:** reintroduza a identidade rústica/editorial, o hero azul genérico, cards arredondados em série ou dashboard sem contexto.
- **Não faça:** misture cliente e admin em uma mesma superfície.
- **Não faça:** invente prova social, métricas ou sucesso de integração.
