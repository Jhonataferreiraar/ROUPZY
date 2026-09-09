---
version: alpha
name: "Roupzy"
description: "Sistema brasileiro de guarda-roupa pessoal que transforma peças reais em possibilidades de vestir, com tecnologia discreta e linguagem visual editorial de produto."
colors:
  primary: "#3D5AF4"
  navy: "#101A3B"
  coral: "#FF6C78"
  cyan: "#B9EDFF"
  paper: "#EEF2F7"
  surface: "#FFFFFF"
  ink: "#111A38"
  muted: "#6F7992"
  line: "#DCE4EF"
  success: "#53D09A"
typography:
  display:
    fontFamily: "'Roupzy Display', 'Space Grotesk', 'Segoe UI', sans-serif"
    fontSize: "74px"
    lineHeight: "0.91"
  body:
    fontFamily: "'Roupzy Sans', 'Manrope', 'Segoe UI', Arial, sans-serif"
    fontSize: "15px"
    lineHeight: "1.65"
  utility:
    fontFamily: "'Roupzy Sans', 'Manrope', 'Segoe UI', Arial, sans-serif"
    fontSize: "10px"
    lineHeight: "1.35"
rounded:
  DEFAULT: "13px"
  sm: "9px"
  md: "13px"
  lg: "17px"
  pill: "999px"
spacing:
  page-gutter: "42px"
  mobile-gutter: "16px"
  card-gap: "13px"
  section-gap: "38px"
  content-max: "1480px"
components:
  button:
    rounded: "{rounded.sm}"
    height: "43px"
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
  card:
    rounded: "{rounded.lg}"
    backgroundColor: "{colors.surface}"
  admin-sidebar:
    width: "272px"
    backgroundColor: "{colors.navy}"
  data-metric:
    rounded: "{rounded.md}"
    typography: "{typography.display}"
  public-hero:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.surface}"
  accent-action:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.ink}"
  context-signal:
    backgroundColor: "{colors.cyan}"
    textColor: "{colors.ink}"
  page-surface:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  success-state:
    backgroundColor: "{colors.success}"
    textColor: "{colors.ink}"
  muted-surface:
    backgroundColor: "{colors.line}"
    textColor: "{colors.ink}"
  muted-text:
    textColor: "{colors.muted}"
---

# Roupzy Design System

## Overview

### Creative North Star — Acervo Vivo

O Roupzy organiza o guarda-roupa como uma mesa de edição: peças, contexto e escolhas ficam visíveis em camadas simples, como fichas de um acervo que podem ser recombinadas. A interface combina o rigor de um sistema de catalogação com o gesto editorial de uma marca de moda. A tecnologia aparece como estrutura, nunca como personagem.

### Product context and register

- **Audience and primary job:** Pessoas com um armário real que querem decidir o que vestir, organizar as peças e redescobrir combinações usando somente o que já possuem.
- **Target market(s) and evidence:** Brasil; o produto, textos, moeda, datas e rotas institucionais estão em português brasileiro e o modelo de cobrança está preparado para BRL.
- **Locale(s) and language policy:** `pt-BR` é a única interface publicada. Datas, números, mensagens, rótulos e acessibilidade usam português brasileiro; termos técnicos só aparecem quando são necessários para o dono do produto.
- **Usage scene:** Uso recorrente em celular e desktop, geralmente no momento de escolher uma roupa ou administrar o próprio catálogo. A área do cliente privilegia foco e toque; o admin privilegia leitura densa e operação rápida.
- **Register:** Híbrido. O site público tem expressão de marca; autenticação e área do cliente têm familiaridade; o admin é um produto operacional separado, com densidade e hierarquia próprias.
- **Memorable signature:** O Acervo Vivo: peças aparecem como fichas editoriais conectadas a contexto, uso e novas combinações. Linhas finas, blocos de cor e painéis transformam o armário em matéria-prima visual. No admin, a assinatura vira um centro de comando com leitura do movimento real do produto.
- **Restraint:** Corpo de texto, formulários, tabelas, estados vazios e ações destrutivas devem ser calmos, claros e previsíveis. A cor coral marca decisão ou atenção; não decora cada componente.
- **Anti-references:** Templates SaaS genéricos, dashboards corporativos cinzentos, gradientes tecnológicos, glassmorphism, excesso de badges, ilustrações de robô e páginas que confundem o painel administrativo com o espaço do cliente.
- **Token ownership/runtime mapping:** `app/roupzy-v3.css` é a camada canônica do redesign Acervo Vivo e é carregada por último em `app/layout.jsx`. `app/roupzy.css` e `app/roupzy-redesign.css` preservam estilos estruturais legados ainda consumidos por componentes existentes. Componentes compartilhados consomem as variáveis `--rq-*` e os tokens administrativos `--admin-*`; toda nova decisão visual deve entrar em `roupzy-v3.css` até a migração final das folhas antigas.

## Colors

A base usa papel azulado para separar o produto do site institucional e navy para superfícies de controle. Azul é a ação principal e a navegação ativa; coral é decisão, destaque e atenção; cyan é contexto e sinal de operação; verde é estado de pronto; vermelho fica reservado para erro ou ação destrutiva. Superfície branca, tinta navy e linha azul clara formam a leitura diária. Cor nunca é o único indicador: estados também usam texto, posição, ícone e borda.

A área pública pode usar o mesmo vocabulário em composições mais expressivas. O admin usa a mesma marca, mas reduz a ornamentação e aumenta a densidade de informação. O contraste de texto e foco deve ser mantido para WCAG 2.2 AA; quando uma cor de marca não atingir contraste suficiente, usa-se tinta navy ou texto auxiliar apropriado.

## Typography

`Roupzy Display` é a face de títulos e números de destaque. `Roupzy Sans` é a face de interface, corpo, labels e tabelas. Ambas são auto-hospedadas em `public/fonts` e têm fallbacks compatíveis. Títulos usam tracking levemente negativo, sem comprimir as palavras; corpo usa tracking normal; labels curtos em caixa alta usam tracking positivo moderado.

O display chega a 74px em uma composição ampla, 42px no celular e diminui em títulos de seção. O corpo parte de 15px com altura entre 1.55 e 1.75. Números de métrica usam a face display, mas não recebem tracking tão negativo quanto o hero. Textos longos permanecem em medida confortável; nomes, e-mails e chaves administrativas truncam com acesso ao valor completo quando necessário.

## Layout

A página pública usa uma malha editorial com gutters amplos e uma demonstração visual que explica o produto. A área do cliente usa sidebar fixa no desktop e navegação horizontal/compacta no celular, com conteúdo natural rolável. O admin usa sidebar de 272px, cabeçalho de contexto e uma coluna de controle limitada por `--content-max`; tabelas e listas podem rolar dentro da própria superfície, sem prender formulários longos em uma altura artificial.

O ritmo principal usa 9, 13, 17, 24, 28, 38 e 42px conforme a densidade da superfície. Em mobile, o gutter padrão é 16px e ações importantes ocupam largura suficiente para toque. O layout reserva espaço para mensagens de erro, carregamento e conteúdo assíncrono, evitando saltos.

## Elevation & Depth

Hierarquia vem primeiro de superfícies e bordas. Cards de operação usam sombra curta e suave (`0 7px 20px rgb(28 42 75 / 5%)`); a sombra mais forte fica para menus, diálogos e superfícies flutuantes. O admin tem um hero navy com grade discreta para demarcar a visão global, mas suas tabelas, formulários e estados de leitura ficam em superfícies claras. Blur não é linguagem estrutural.

## Shapes

Controles importantes usam raio de 9–10px; cards usam 13–17px; pílulas ficam reservadas para status, ambiente e pequenos sinais de sistema. Bordas são finas e visíveis. Ícones ficam em containers pequenos quando precisam de enquadramento. A assinatura visual usa linhas, grades e blocos, não blobs ou círculos decorativos em excesso.

## Components

### Foundational visual states

Todos os controles têm repouso, hover, foco visível, pressionado, desabilitado e ocupado quando aplicável. O foco usa outline cyan ou azul com offset. Sucesso aparece com texto e sinal verde; erro usa mensagem persistente e coral; loading preserva a geometria do controle. Áreas vazias explicam o próximo passo. Respeita-se `prefers-reduced-motion`.

### Buttons and actions

A ação principal é sólida azul, com texto explícito e altura mínima de 43px. Ação neutra é outline ou ghost. Ação destrutiva fica separada e usa intenção visual própria. Setas são complementos e não substituem o verbo. Botões ocupados mantêm largura e anunciam a mudança por texto ou estado acessível.

### Navigation and data display

Site público tem navegação curta e uma ação principal. Cliente tem grupos `Início`, `Organizar`, `Acompanhar` e `Conta`. Admin tem grupos `Visão do negócio`, `Operação` e `Governança`, com a área do cliente e o site público como acessos externos. Breadcrumbs e títulos de rota identificam onde a pessoa está. Métricas mostram nome, valor e contexto temporal; auditoria mostra resultado, evento, responsável e quando.

### Forms and overlays

Campos têm labels visíveis, estados de erro associados e mensagens de produto próximas da operação. Inputs sensíveis ficam mascarados, com controle para revelar a senha quando necessário. Selects nativos são aceitos quando o popup do sistema é suficiente; o contrato não promete geometria própria para o popup. Destruições ou mudanças de permissão usam confirmação do produto. Mensagens de status ficam próximas da operação e em região anunciável.

### Iconography

O produto usa símbolos lineares e glifos pequenos já presentes no sistema, sempre acompanhados de texto quando a ação não é universal. Setas representam navegação; pontos representam estado; o monograma R é a marca. Ícones não carregam sozinhos uma decisão crítica.

### Motion

Movimento é curto e funcional: hover e foco em 140–180ms, transições de superfície em cerca de 220ms e entradas de conteúdo em até 360ms. Não há animação contínua em conteúdo de leitura. Quando `prefers-reduced-motion` está ativo, transições e animações são reduzidas sem remover estados.

### Content and data visualization

A voz é brasileira, direta e específica. Ações usam verbos reais: `Atualizar dados`, `Cadastrar plano`, `Salvar função`, `Bloquear`, `Ver auditoria`. Datas usam `pt-BR`; moeda usa BRL. Gráficos são discretos, usam azul/coral/cyan e sempre acompanham um valor textual ou resumo acessível. Dados administrativos exibem somente a medida e a finalidade necessárias.

## Do's and Don'ts

- **Do:** tratar o armário como acervo real e o painel como centro operacional, com vocabulário específico para cada área.
- **Do:** reutilizar os shells compartilhados e tokens de `app/roupzy-redesign.css` antes de criar uma exceção local.
- **Don't:** misturar cliente e admin na mesma navegação ou criar uma segunda navegação redundante dentro da visão geral.
- **Don't:** usar gradientes genéricos, títulos comprimidos, botões com apenas seta ou métricas sem período e contexto.
