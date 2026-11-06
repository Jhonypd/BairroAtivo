# Evidências TDD — PB13

## Estado

Na reorganização de navegação, a aba **Ocorrências** passou a oferecer **Todas as ocorrências** e **Minhas ocorrências** em um seletor no topo. A listagem pública preserva busca e filtros; a visualização privada continua usando `listarMinhasOcorrencias()` e exige sessão. Visitantes recebem uma chamada para entrar com Google dentro da visualização privada, sem perder o acesso público. A aba **Perfil** agora abre uma tela própria com dados básicos da conta e logout. Esta alteração é somente de interface/navegação; não modifica RLS nem estrutura do banco.

Esta entrega tem uma dependência de banco ainda não aplicada: a listagem privada chama `howviii.listar_minhas_ocorrencias()`. A coluna `autor_id` não pode ser lida pelos papéis `anon` e `authenticated`, portanto a listagem direta com filtro PostgREST não é válida. A proposta SQL está em `docs/sql/PB13_listar_minhas_ocorrencias.sql` e não foi executada.

A proposta agora resolve a identidade com `auth.uid()` e fallback para `request.jwt.claim.sub` e `request.jwt.claims`, tanto na policy quanto na RPC. Os casos de verificação estão em `docs/sql/PB13_verificacoes_identidade.sql`; ainda não foram executados e aguardam revisão do banco.

## Evidências dos ciclos

Nesta revisão foram adicionados testes para ID inválido, registro inexistente, falha de consulta, atualização bloqueada pelo RLS e exclusão com zero linhas (caso de outro autor) ou contagem nula. A implementação precedeu esses testes nesta sessão; portanto não há evidência honesta de uma execução Red anterior para estes casos. A suíte final passou: 17 suítes e 80 testes. Não foram presumidos resultados.

| Caso | Teste | Red | Green | Refactor |
|---|---|---|---|---|
| Visitante bloqueado | Proteção da rota privada (teste existente) | Existente | Incluído na suíte final; passou | Pendente |
| Listagem própria e lista vazia | Serviço RPC e tela Minhas ocorrências | Implementação antes do teste | Coberto; passou | Pendente |
| Campos editáveis e validações | Serviço de atualização e validação existente da PB09 | Implementação antes do teste | Payload permitido passou; cobertura de limites já existente na PB09 | Pendente |
| Atualização com sucesso e falha | Serviço de atualização | Implementação antes do teste | Passou | Pendente |
| Tentativa de editar registro alheio | Erro simulado de autorização; integração real pendente | Implementação antes do teste | Erro simulado passou | Validação DB pendente |
| Tentativa de excluir registro alheio | Outro autor com RLS retornando count 0 | Implementação antes do teste | Passou; count 0 rejeitado | Validação DB pendente |
| Exclusão sem contagem | count nulo | Implementação antes do teste | Passou; count nulo rejeitado | Validação DB pendente |
| Exclusão cancelada, confirmada e falha | Tela e serviço de exclusão | Cancelamento coberto; confirmação/falha de tela pendentes | Testes cobertos passaram | Pendente |
| Atualização da listagem | Retorno ao foco após editar/excluir | Pendente | Indiretamente pela estratégia de foco; teste específico pendente | Pendente |
| Regressões PB09–PB12 | Suíte existente | Existente | 16 suítes, 75 testes aprovados | Pendente |

## Verificações de código

- Após a reorganização da navegação: `npm test -- --runInBand` passou (18 suítes, 87 testes), incluindo seleção Todas/Minhas para visitante, retorno à listagem pública, navegação para Perfil e apresentação/logout da conta.
- `npm run typecheck`: passou.
- `npm run lint`: passou sem alertas.
- `git diff --check`: passou.
- `npx expo-doctor`: 19/20 verificações passaram. A verificação pendente é a compatibilidade de dependências Expo: `react-native-safe-area-context` (esperado `~5.11.1`, instalado `5.10.1`) e oito divergências de patch (`@expo/ui`, `expo`, `expo-constants`, `expo-dev-client`, `expo-linking`, `expo-router`, `expo-splash-screen` e `jest-expo`). Não foram feitos upgrades, pois esta mudança não adiciona dependências nem altera APIs nativas.

## Verificação de banco (somente leitura)

- Projeto `ADS-UNIVALI`, schema `howviii`, tabela `ocorrencias` verificados.
- `autor_id` não consta nas permissões `SELECT` de `anon` nem `authenticated`.
- RLS ativo; políticas de `UPDATE` e `DELETE` verificam `autor_id = auth.uid()`.
- FKs de `fotos_ocorrencias` e `apoios` para ocorrências usam `ON DELETE CASCADE`; não há exclusão manual pelo aplicativo.
- O papel `authenticated` possui `UPDATE` em `status`, então as permissões atuais permitem mudar status diretamente. A proposta SQL inclui revogar `UPDATE` na tabela e conceder apenas os cinco campos editáveis da PB13. Isso precisa ser revisado e validado para impedir clientes adulterados e preservar fluxos privilegiados futuros.
- A verificação com `has_column_privilege` confirmou `UPDATE` efetivo em `titulo`, `descricao`, `categoria`, `bairro`, `latitude`, `longitude`, `status` e `nome_publico`; não em `id`, `autor_id`, `total_apoios`, `criado_em` ou `atualizado_em`. `autor_id` não tem `SELECT` efetivo para `authenticated`.

## SQL pendente

A versão proposta cria uma role `NOLOGIN NOINHERIT NOBYPASSRLS`, sem associação com outras roles, como proprietária da função. Essa role recebe somente `SELECT` das colunas necessárias e uma política RLS adicional que limita a leitura a `autor_id = auth.uid()`; a função repete o filtro, não recebe ID de usuário, usa `search_path = ''` e referencia objetos com schema explícito. O ACL da função revoga execução de `PUBLIC`, `anon` e `authenticated` antes de liberar apenas `authenticated`. Mesmo no schema exposto `howviii`, a função só fica acessível pela role autenticada. O script também restringe UPDATE a cinco colunas. Riscos: requer execução por role administrativa capaz de criar role/policy e transferir propriedade; a política nova e o corte de latitude/longitude podem afetar consumidores não inventariados. Revisar com o responsável do banco, validar com dois usuários e revisar usos de coordenadas antes de aplicar. Nenhuma mudança no banco foi aplicada nesta implementação.
