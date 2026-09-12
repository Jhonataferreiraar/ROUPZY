# Laboratório SCA do Roupzy

Este manifesto contém versões históricas com vulnerabilidades públicas conhecidas para testar Dependabot, GitHub Dependency Review e `npm audit`. Ele é independente do aplicativo: não possui código executável, não é importado pelo Roupzy e não deve ser instalado na raiz do projeto.

As versões foram fixadas de propósito. O objetivo do exercício é observar os alertas, atualizar cada dependência para uma versão corrigida e confirmar que a ferramenta deixa de reportar o problema.

## Alertas esperados

Com o lockfile atual, `npm audit` encontra cinco vulnerabilidades:

| Dependência | Versão fixada | Resultado esperado |
| --- | ---: | --- |
| `minimist` | `1.2.5` | 1 crítica — prototype pollution |
| `axios` | `0.21.1` | vulnerabilidades altas, incluindo ReDoS e SSRF |
| `json5` | `1.0.1` | 1 alta — prototype pollution |
| `lodash` | `4.17.20` | vulnerabilidades altas, incluindo command injection |
| `node-fetch` | `2.6.1` | 1 alta — encaminhamento indevido de cabeçalhos |

Esse resultado pertence apenas ao manifesto de treinamento. A auditoria do `package.json` principal do Roupzy continua limpa.

## Exercício

1. Abra o repositório no GitHub e verifique **Security → Dependabot alerts**.
2. Execute manualmente o workflow `SCA — dependências de treinamento` na aba **Actions**.
3. Anote o pacote, a versão afetada, o advisory e a versão corrigida sugerida.
4. Atualize uma dependência por vez neste `package.json`.
5. Gere novamente o lockfile e rode o workflow até o alerta desaparecer.
6. Registre a correção em um pull request.

## Verificação local

Na pasta do projeto, execute:

```bash
npm audit --prefix security-lab-sca --audit-level=high
```

O comando deve encontrar vulnerabilidades enquanto os exercícios estiverem pendentes. Não execute as dependências do laboratório e não copie essas versões para o `package.json` principal.
