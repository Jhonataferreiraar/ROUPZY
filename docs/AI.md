# IA e Outfit Engine — Roupzy

Status: contratos e regras implementados; o adaptador Gemini é server-only e só executa com credencial configurada. Nenhum custo é simulado.

## Princípio

O sistema usa IA para diminuir o trabalho de catalogação e explicar escolhas. A fonte de verdade da recomendação é o closet da pessoa e as regras do motor. O modelo não pode inventar peça, acessar conta de outra pessoa, escolher um recurso por UUID ou confirmar sucesso de uma operação.

## Interface do provedor

O domínio depende desta interface, com implementação server-only:

```ts
export interface AIProvider {
  analyzeClothing(input: AnalyzeClothingInput): Promise<AIResult<ClothingAnalysis>>
  analyzeInspiration(input: AnalyzeInspirationInput): Promise<AIResult<InspirationAnalysis>>
  rankOutfits(input: RankOutfitsInput): Promise<AIResult<RankedCandidate[]>>
  explainOutfit(input: ExplainOutfitInput): Promise<AIResult<OutfitExplanation>>
}
```

O adaptador recebe referências de arquivo autorizadas e conteúdo mínimo. Ele não recebe cliente, sessão, service role, email ou `owner_id` como instrução de modelo. O `owner_id` serve para registrar uso e autorização fora do prompt.

`AIResult` inclui `provider`, `model`, `operation`, `requestKey`, `usage` quando o fornecedor retorna tokens, duração, estado e erro classificado. O produto só informa custo quando houver cálculo configurado; caso contrário, exibe estado de medição indisponível.

## Contratos de saída

### Análise de peça

Schema validado no servidor:

```ts
type ClothingAnalysis = {
  category: "top" | "bottom" | "one_piece" | "outerwear" | "shoe" | "bag" | "accessory" | "unknown"
  subcategory: string | null
  colors: Array<{ name: string; family: string; confidence: number }>
  pattern: "solid" | "stripe" | "plaid" | "floral" | "graphic" | "animal" | "other" | "unknown"
  material: string | null
  fit: "slim" | "regular" | "relaxed" | "oversized" | "unknown"
  formality: 1 | 2 | 3 | 4 | 5
  seasons: Array<"summer" | "autumn" | "winter" | "spring" | "all_year">
  weather: { minC: number | null; maxC: number | null }
  visibleText: string | null
  notes: string | null
}
```

Enums, comprimento de texto, quantidade de cores, confiança entre 0 e 1 e números de temperatura são validados. `unknown` é um resultado aceitável e abre revisão manual. A confiança do modelo não é exibida como compatibilidade do look.

### Inspiração

O modelo identifica somente características visíveis da referência: categorias, cores, silhueta, camadas, formalidade, textura e clima provável. Ele não identifica pessoa, corpo, idade, saúde, raça, gênero ou outros atributos sensíveis. O matching compara essa descrição com peças próprias já autorizadas.

### Ranking e explicação

`rankOutfits` recebe candidatos criados pelo motor, cada um com IDs já carregados do usuário. A resposta só pode ordenar IDs presentes na entrada e incluir uma justificativa curta. A validação rejeita ID ausente, repetido, peça de outro dono ou alteração estrutural do candidato.

`explainOutfit` pode gerar linguagem natural a partir de atributos persistidos. Se falhar, a aplicação usa explicação determinística, por exemplo: “camisa leve + calça escura, adequado à ocasião selecionada”.

## Pipeline de peça

1. Usuário envia uma foto pelo formulário do closet; o servidor valida o arquivo, cria o asset privado e registra a peça.
2. O arquivo é validado por MIME, extensão, assinatura, tamanho e dimensões antes de ser aceito.
3. A interface dispara a rota autenticada de análise uma vez para a peça, e a rota consulta o `AIProvider` com chave idempotente baseada na peça e no contrato.
4. O resultado é validado e persistido como `analysis_version`.
5. O usuário confirma ou corrige atributos.
6. Correções manuais ficam acima da sugestão da IA e não são apagadas por uma reexecução automática.

Uma mesma versão de imagem e contrato não é analisada novamente a cada recomendação. Se o modelo mudar, o contrato mudar ou a pessoa solicitar uma nova análise, isso gera uma nova versão e um novo registro de uso.

## Outfit Engine determinístico

O motor recebe:

- peças `ready`, ativas e pertencentes à conta;
- ocasião e vibe escolhidas;
- preferências de cor, formalidade e estilo;
- clima fornecido pelo produto, quando disponível;
- feedback e histórico recentes, sem transformar rejeição em regra impossível.

Fluxo:

1. separar papéis possíveis — parte de cima, parte de baixo, peça única, terceira peça, calçado e acessórios;
2. gerar candidatos respeitando compatibilidade estrutural;
3. remover combinações com peças indisponíveis, duplicadas ou incompatíveis com restrições explícitas;
4. calcular score versionado por sinais reais;
5. diversificar os três primeiros para evitar repetir a mesma peça em todas as posições;
6. enviar apenas candidatos válidos ao ranking opcional da IA;
7. revalidar a resposta e salvar o resultado.

O score interno é uma função documentada e calibrada com testes, por exemplo:

```text
score =
  0.30 * cor
  + 0.20 * ocasião
  + 0.15 * vibe
  + 0.15 * clima
  + 0.10 * preferência
  + 0.10 * novidade_de_uso
```

Esses pesos são parâmetros versionados, não uma promessa de precisão. Se um sinal não existir, o motor redistribui ou marca a ausência; não inventa dados. A fase 9 definirá a fórmula final e a suíte de casos dourados.

Se o closet não oferecer três combinações válidas, o produto mostra a quantidade real e uma ação útil, como adicionar uma categoria ou revisar uma preferência. Nunca cria peça externa ou exibe uma compatibilidade sem cálculo.

## Custo, quota e falhas

Antes da chamada, uma operação reservável verifica entitlement e registra uma chave idempotente. Depois da chamada, registra provider, model, operation, tokens retornados, custo estimado com a versão de preço, duração e resultado. Em timeout ou erro, a reserva é liberada ou marcada conforme a política definida, sem contar um sucesso inexistente.

Os timeouts são curtos e configuráveis por operação. Fallbacks são explícitos:

- análise de peça falha: peça fica em revisão manual;
- ranking falha: candidatos determinísticos continuam válidos;
- explicação falha: texto de regra é usado;
- provedor indisponível: interface informa que a análise não foi concluída;
- quota esgotada: o usuário recebe limite e próximo passo, sem resultado falso.

## Segurança da entrada

Imagens e textos enviados pelo usuário são conteúdo não confiável. A inspiração aceita upload de imagem privado; URLs externas permanecem fora do fluxo até existir uma política explícita de allowlist e download controlado. O modelo não recebe instruções vindas da imagem como comandos do sistema.

Prompts são versionados no código ou em configuração controlada, com testes de regressão. Respostas são tratadas como dados, nunca executadas como JavaScript, SQL ou HTML confiável.

## Avaliação

Antes de liberar análise e recomendações:

- conjunto de imagens licenciadas ou criadas para teste, sem fotos reais de usuários;
- resposta esperada por categoria, cor e papel da peça;
- teste de schema e enum;
- teste de ID externo e prompt injection;
- casos de closet pequeno, cores difíceis, peças sem análise e atributos corrigidos;
- métrica determinística de validade dos looks;
- revisão humana amostral de qualidade e explicação;
- medição de taxa de reanálise, latência, erro e custo.

O alvo de “identificar corretamente” precisa ser definido por categoria e conjunto de avaliação. Não será inferido de uma única demonstração.

### Referências

- [Gemini — Structured outputs](https://ai.google.dev/gemini-api/docs/structured-output)
- [Claude Cookbook — Best practices for vision](https://github.com/anthropics/anthropic-cookbook/tree/main/multimodal)
- [Claude Cookbook — Extracting structured JSON](https://github.com/anthropics/anthropic-cookbook/blob/main/tool_use/extracting_structured_json.ipynb)
- [Claude Cookbook — Building evals](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/building_evals.ipynb)
