# Estratégia de testes

## Checks locais

- npm run lint
- npm run typecheck
- npm test
- npm run build

## Prioridades de segurança

O teste de integração deve criar dois usuários, inserir peças e looks separados e tentar executar SELECT, UPDATE, DELETE e download de Storage cruzando os UUIDs. Cada tentativa deve resultar em conjunto vazio, erro de autorização ou resposta equivalente sem vazamento de dados.

O teste administrativo deve validar usuário sem admin_roles, role revogada e role ativa. A área admin deve negar os dois primeiros casos e consultar métricas somente com chave server-only.

O teste de upload deve cobrir MIME divergente, extensão enganosa, bytes inválidos, arquivo acima de 10 MB, dimensões acima do limite e path fora da pasta do usuário.

O teste do motor deve cobrir closet insuficiente, categorias incompatíveis, cor evitada, formalidade, ocasião, clima, diversificação e no máximo três candidatos. Os IDs retornados precisam pertencer à entrada.

Os testes unitários em `tests/domain.test.ts` cobrem o limite de três candidatos, a correspondência determinística de inspiração, a rejeição de bytes inválidos e a extensão enganosa. O endpoint privado de conta também oferece exportação dos dados próprios em JSON. Os testes de integração com dois projetos Supabase separados devem ser executados antes do primeiro deploy de produção.

## IA

As respostas do provider devem ser mockadas nos testes de contrato. Validar JSON incompleto, enum inválido, item fora dos candidatos, repetição de ID, timeout e ausência de credencial. O teste confirma persistência do status e do registro ai_usage sem expor o conteúdo da imagem.

## Aceite manual

Validar cadastro, confirmação de e-mail, recuperação e troca de senha, onboarding, upload privado, análise acionada pela foto, correção dos atributos, filtros de categoria e situação da peça, arquivamento, geração com ocasião, vibe e temperatura, gostei, rejeição, favorito com remoção, usado hoje sem duplicidade, detalhe seguro do look, histórico, estatísticas, notificações com leitura individual e em lote, preferências, exportação de dados, contato, feedback, bloqueio administrativo, publicação do conteúdo institucional e proteção de rotas em desktop e mobile.
