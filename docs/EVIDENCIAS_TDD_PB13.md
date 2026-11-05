# Evidências TDD — PB13

## Estado

Esta entrega tem uma dependência de banco ainda não aplicada: a listagem privada chama `howviii.listar_minhas_ocorrencias()`. A coluna `autor_id` não pode ser lida pelos papéis `anon` e `authenticated`, portanto a listagem direta com filtro PostgREST não é válida. A proposta SQL está em `docs/sql/PB13_listar_minhas_ocorrencias.sql` e não foi executada.

## Evidências dos ciclos

Foram adicionados testes de tela para lista própria, estado vazio e cancelamento explícito de exclusão, além de testes do serviço de RPC, payload de edição, falha simulada de autorização e exclusão sem limpeza manual de relacionamentos. A implementação precedeu esses testes nesta sessão; portanto não há evidência honesta de uma execução Red anterior para estes casos. A suíte final passou: 16 suítes e 75 testes. Não foram presumidos resultados.

| Caso | Teste | Red | Green | Refactor |
|---|---|---|---|---|
| Visitante bloqueado | Proteção da rota privada (teste existente) | Existente | Incluído na suíte final; passou | Pendente |
| Listagem própria e lista vazia | Serviço RPC e tela Minhas ocorrências | Implementação antes do teste | Coberto; passou | Pendente |
| Campos editáveis e validações | Serviço de atualização e validação existente da PB09 | Implementação antes do teste | Payload permitido passou; cobertura de limites já existente na PB09 | Pendente |
| Atualização com sucesso e falha | Serviço de atualização | Implementação antes do teste | Passou | Pendente |
| Tentativa de editar registro alheio | Erro simulado de autorização; integração real pendente | Implementação antes do teste | Erro simulado passou | Validação DB pendente |
| Exclusão cancelada, confirmada e falha | Tela e serviço de exclusão | Cancelamento e execução do serviço cobertos; confirmação/falha da tela pendentes | Testes cobertos passaram | Pendente |
| Atualização da listagem | Retorno ao foco após editar/excluir | Pendente | Indiretamente pela estratégia de foco; teste específico pendente | Pendente |
| Regressões PB09–PB12 | Suíte existente | Existente | 16 suítes, 75 testes aprovados | Pendente |

## Verificações de código

- `npm test -- --runInBand`: passou (16 suítes, 75 testes).
- `npm run typecheck`: passou.
- `npm run lint`: passou sem alertas.
- `git diff --check`: passou.
- `npx expo-doctor`: 19/20 verificações passaram; falhou somente a compatibilidade de versões de dependências Expo, que já estavam divergentes no `package.json` de `develop`.

## Verificação de banco (somente leitura)

- Projeto `ADS-UNIVALI`, schema `howviii`, tabela `ocorrencias` verificados.
- `autor_id` não consta nas permissões `SELECT` de `anon` nem `authenticated`.
- RLS ativo; políticas de `UPDATE` e `DELETE` verificam `autor_id = auth.uid()`.
- FKs de `fotos_ocorrencias` e `apoios` para ocorrências usam `ON DELETE CASCADE`; não há exclusão manual pelo aplicativo.
- O papel `authenticated` possui `UPDATE` em `status`, então as permissões atuais permitem mudar status diretamente. A proposta SQL inclui revogar `UPDATE` na tabela e conceder apenas os cinco campos editáveis da PB13. Isso precisa ser revisado e validado para impedir clientes adulterados e preservar fluxos privilegiados futuros.

## SQL pendente

A proposta SQL revoga as permissões amplas e de coluna de `UPDATE` de `authenticated` e concede somente `titulo`, `descricao`, `categoria`, `bairro` e `nome_publico`, removendo assim a edição de `status` e demais colunas internas por clientes comuns. A função de listagem usa `SECURITY DEFINER`, recebe zero parâmetros, fixa `search_path`, deriva o proprietário por `auth.uid()`, projeta apenas campos operacionais e restringe execução a `authenticated`. Risco: função ou grants mal configurados podem ampliar leitura ou interromper operações futuras; revisar, aplicar em ambiente controlado e validar com dois usuários antes de liberar a PB13. Nenhuma mudança no banco foi aplicada durante esta implementação.
