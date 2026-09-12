# Laboratório SCA do Roupzy

Este manifesto contém as versões corrigidas das dependências usadas no exercício de SCA. Ele permanece separado do código funcional e serve para confirmar que Dependabot, GitHub Dependency Review e `npm audit` reconhecem a correção.

As versões estão fixadas para tornar o resultado reproduzível. O objetivo agora é confirmar que os alertas foram encerrados depois do upgrade.

## Estado após a correção

Com o lockfile atual, `npm audit` deve retornar zero vulnerabilidades:

| Dependência | Versão fixada | Resultado esperado |
| --- | ---: | --- |
| `minimist` | `1.2.8` | corrigida |
| `axios` | `1.20.0` | corrigida |
| `json5` | `2.2.3` | corrigida |
| `lodash` | `4.18.1` | corrigida |
| `node-fetch` | `3.3.2` | corrigida |

As mesmas versões corrigidas estão no `package.json` principal do Roupzy como dependências de desenvolvimento. Elas não são importadas pelas rotas do aplicativo.

## Exercício

1. Abra o repositório no GitHub e verifique **Security → Dependabot alerts**.
2. Execute manualmente o workflow `SCA — dependências de treinamento` na aba **Actions**.
3. Confirme que o `npm audit` retorna zero vulnerabilidades.
4. Consulte o histórico deste commit para comparar as versões afetadas e corrigidas.
5. Registre a correção em um pull request.

## Verificação local

Na pasta do projeto, execute:

```bash
npm audit --prefix security-lab-sca --audit-level=high
```

O comando deve retornar zero vulnerabilidades. Não copie dependências sem necessidade para o `package.json` principal.
