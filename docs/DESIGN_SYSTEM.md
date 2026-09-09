# Sistema de design — Roupzy

Este documento resume o sistema visual aplicado ao produto. O contexto completo e canônico para novas telas está em [`DESIGN.md`](../DESIGN.md), na raiz do projeto. O contrato de comportamento e responsividade está em [`UX-CONTRACT.md`](../UX-CONTRACT.md).

## Direção

Roupzy é um instrumento pessoal para decidir o que vestir. A interface combina a presença de uma marca de moda com a precisão de um sistema: azul cobalto e azul noite estruturam a navegação, coral marca decisões e ciano sinaliza orientação. A tecnologia aparece no ritmo, nos estados e nas recomendações, sem virar decoração futurista.

O sistema evita templates genéricos de SaaS, gradientes roxos, glassmorphism, blobs, excesso de badges, sombras decorativas e símbolos que tentam representar IA.

## Tokens em produção

Os tokens abaixo são a referência semântica atual. As definições em código ficam centralizadas em `app/roupzy.css` e `app/roupzy-redesign.css`; componentes não devem inventar cores, fontes ou espaçamentos fora desses papéis.

```css
:root {
  --rz-ink: #10162d;
  --rz-night: #0c1230;
  --rz-night-2: #151e49;
  --rz-blue: #3454f5;
  --rz-blue-deep: #20339c;
  --rz-cyan: #b7eaff;
  --rz-coral: #ff6974;
  --rz-paper: #f4f6fb;
  --rz-white: #ffffff;
  --rz-muted: #68708c;
  --rz-line: #dce2ef;
  --rz-soft: #e9eef8;
  --rq-success: #53d09a;
}
```

Tipografia usa `Roupzy Display` para títulos e `Roupzy Sans` para interface, corpo, números e controles. As fontes são locais em `public/fonts`. Títulos usam tracking negativo moderado; textos corridos mantêm altura de linha confortável. Labels curtos podem usar caixa alta e tracking mais aberto.

## Composições

- **Site público:** moldura editorial, hero escuro com grade fina, demonstração real do produto e seções em papel branco. A ação primária é uma pílula com seta circular; links de navegação têm sublinhado de estado.
- **Autenticação:** composição dividida entre manifesto visual e formulário claro, com a mesma marca e os mesmos estados de campo do produto.
- **Painel do cliente:** ambiente de trabalho claro, navegação lateral própria, ação de adicionar sempre acessível, cartões com dados reais e uma área inicial que explica a próxima ação.
- **Painel global:** centro de comando separado, com navegação operacional agrupada, métricas reais, trilha de auditoria e controles administrativos em rotas próprias.

## Componentes e estados

Botões, links de ação, campos, selects, cartões, tabelas, filtros, estados vazios, feedbacks, diálogos e menus devem ter repouso, hover, foco visível, pressionado, desabilitado, carregando e erro quando aplicável. A ação deve explicar seu resultado. Ícones nunca substituem um nome acessível.

Formulários são controlados no servidor quando alteram dados, exibem mensagens em português e preservam o contexto após erro. Senhas podem ser reveladas por um controle explícito. Operações de carregamento usam `role="status"`; erros usam `role="alert"`. Conteúdo privado nunca vira uma vitrine administrativa.

## Responsividade e acessibilidade

O mobile é uma composição própria: navegação compacta, menu que não cobre a ação principal, leitura vertical, alvos de toque confortáveis e nenhuma dependência de hover. O desktop amplia contexto e densidade sem esticar a coluna.

Validar 320px, 390px, 768px e desktop amplo, incluindo zoom de 200%, teclado, contraste e redução de movimento. O objetivo é WCAG 2.2 AA e uma navegação sem overflow horizontal.

## Manutenção

Antes de criar uma variação, procure um token ou componente existente. Ao alterar um padrão compartilhado, atualize `DESIGN.md`, `UX-CONTRACT.md` e este resumo. O CSS de `app/roupzy-redesign.css` é a última camada de refinamento visual carregada por `app/layout.jsx`; regras novas devem usar seletores de superfície claros e preservar o comportamento dos componentes.
