# Evidências TDD — PB13

## Estado

Na reorganização de navegação, a aba **Ocorrências** passou a oferecer **Todas as ocorrências** e **Minhas ocorrências** em um seletor no topo. A listagem pública preserva busca e filtros; a visualização privada continua usando `listarMinhasOcorrencias()` e exige sessão. Visitantes recebem uma chamada para entrar com Google dentro da visualização privada, sem perder o acesso público. A aba **Perfil** agora abre uma tela própria com dados básicos da conta e logout. Esta alteração é somente de interface/navegação; não modifica RLS nem estrutura do banco.

As duas opções usam a mesma tela e os mesmos controles de busca, status, bairro, categoria, contagem, cards e navegação. A troca de opção muda a origem dos dados (`listarOcorrencias()` ou `listarMinhasOcorrencias()`); editar e excluir são exibidos apenas nos cards da lista autenticada. A rota legada `/minhas-ocorrencias` abre essa mesma tela já na opção privada.

Com base no protótipo Figma, os filtros públicos agora ficam em painel recolhido por padrão. O painel mantém rascunhos temporários, descarta as mudanças ao fechar e aplica os novos valores somente depois de uma atualização bem-sucedida da listagem. A confirmação usa a consulta real já existente e o overlay global anuncia “Atualizando ocorrências”, com o módulo oficial `expo-blur` (`~58.0.5`) e alvo de desfoque no Android; não foi introduzido atraso ou serviço simulado. O estado vazio permite limpar busca e filtros efetivos.

Segundo a validação informada pelo responsável, `howviii.listar_minhas_ocorrencias()` já está instalada e funcionando. A coluna `autor_id` não pode ser lida diretamente pelos papéis `anon` e `authenticated`, então a listagem pessoal usa essa RPC. `docs/sql/PB13_listar_minhas_ocorrencias.sql` é somente a proposta de instalação inicial e não deve ser executada sobre a função existente.

A função instalada já teve a leitura dos claims corrigida para aceitar `request.jwt.claim.sub` e `request.jwt.claims`. A migração incremental `docs/sql/PB13_adicionar_total_apoios_rpc_incremental.sql` preserva esse comportamento, o proprietário restrito e a policy existente, sem chamar `auth.uid()` nem substituir políticas RLS. Ela está proposta para revisão e não foi executada.

O script anterior `docs/sql/PB13_corrigir_claims_minhas_ocorrencias_incremental.sql` pertence ao diagnóstico já realizado dos claims e não é necessário para esta alteração de retorno. Não deve ser usado para adicionar `total_apoios`.

## Evidências da validação — 11/11/2026

Não foi executada uma nova sequência TDD Red-Green-Refactor durante esta validação. O trabalho desta sessão revisou e completou os testes do PR; a evidência abaixo registra somente execuções observadas.

| Área | Evidência automatizada executada | Resultado |
|---|---|---|
| Acesso e listagem | Visitante redirecionado no componente de proteção; lista privada autentica antes de chamar a RPC; estado vazio e falha da RPC tratados | Passou |
| Edição | Rota com ID inválido, registro inexistente e falha de consulta; payload contém somente os campos editáveis; falha de atualização/autorização não confirma sucesso | Passou |
| Exclusão | Confirmação, cancelamento, sucesso removendo o card e falha preservando o item; serviço rejeita `count` zero ou nulo | Passou |
| Sem sessão | Listagem, atualização e exclusão não chamam a operação de dados sem usuário autenticado | Passou |
| Tentativa sobre registro de terceiro | Erro de atualização simulado e exclusão com `count` zero; isso verifica o tratamento no cliente, não executa nem comprova RLS real | Passou como simulação; RLS real pendente |
| Regressões do aplicativo | Suíte Jest completa, incluindo autenticação, filtros, detalhes e rotas | 19 suítes e 103 testes aprovados |

Na suíte foram corrigidos os testes da lista privada para fornecer `SafeAreaProvider`, mockar os ícones do menu usado pelos cards e acompanhar o painel de ações atual (em lugar do fluxo antigo baseado em `Alert`). Foram acrescentados cenários de navegação para editar, confirmar/cancelar/falhar ao excluir e ausência de sessão nas operações de listagem, edição e exclusão.

O usuário informou que já validou manualmente listagem pessoal, edição, exclusão e bloqueio de operações de outros usuários. Essa validação manual não foi repetida nesta sessão. As tentativas de terceiro nos testes Jest são respostas simuladas do serviço e não substituem um ensaio integrado com duas contas e políticas RLS.

## Verificações de código

- `npm test -- --runInBand`: passou, 19 suítes e 103 testes.
- `npm run lint`: passou, sem erros ou alertas.
- `npm run typecheck`: passou.
- `npx expo-doctor`: 19/20 verificações passaram. A única verificação reprovada foi compatibilidade de dependências. O relatório apontou `react-native-safe-area-context` esperado `~5.11.1` (instalado `5.10.1`) e divergências de patch em `@expo/ui`, `expo`, `expo-blur`, `expo-constants`, `expo-dev-client`, `expo-font`, `expo-linking`, `expo-router`, `expo-secure-store`, `expo-splash-screen`, `expo-status-bar`, `expo-symbols`, `expo-web-browser` e `jest-expo`. Nenhuma dependência foi atualizada nesta revisão.
- `git diff --check`: passou.
- `npx expo export --platform web` não foi executado nesta validação; o resultado anterior de 12 rotas não foi revalidado.

## Verificação de banco — registro anterior, não revalidado nesta sessão

- Projeto `ADS-UNIVALI`, schema `howviii`, tabela `ocorrencias` verificados.
- `autor_id` não consta nas permissões `SELECT` de `anon` nem `authenticated`.
- RLS ativo; políticas de `UPDATE` e `DELETE` verificam `autor_id = auth.uid()`.
- FKs de `fotos_ocorrencias` e `apoios` para ocorrências usam `ON DELETE CASCADE`; não há exclusão manual pelo aplicativo.
- O papel `authenticated` possui `UPDATE` em `status`, então as permissões atuais permitem mudar status diretamente. A proposta SQL inclui revogar `UPDATE` na tabela e conceder apenas os cinco campos editáveis da PB13. Isso precisa ser revisado e validado para impedir clientes adulterados e preservar fluxos privilegiados futuros.
- A verificação com `has_column_privilege` confirmou `UPDATE` efetivo em `titulo`, `descricao`, `categoria`, `bairro`, `latitude`, `longitude`, `status` e `nome_publico`; não em `id`, `autor_id`, `total_apoios`, `criado_em` ou `atualizado_em`. `autor_id` não tem `SELECT` efetivo para `authenticated`.

Nesta validação, por instrução, não foi executado SQL nem feita alteração no Supabase. Os itens acima são resultados registrados antes desta sessão e devem ser reconfirmados se o schema ou os grants tiverem mudado.

Em 12/11/2026, uma leitura somente de metadados confirmou que `howviii.ocorrencias.total_apoios` é `integer`, tem valor padrão `0` e a tabela continua com RLS ativa. A definição instalada da RPC, a ACL e dependências em `pg_depend` não foram consultadas por SQL, conforme a restrição desta tarefa; a proposta incremental valida essas pré-condições no ambiente de teste e aborta quando não correspondem ao esperado.

## SQL pendente

`docs/sql/PB13_adicionar_total_apoios_rpc_incremental.sql` verifica a assinatura de oito colunas, o proprietário `bairroativo_pb13_rpc_owner`, `SECURITY DEFINER`, `search_path` vazio, ACL, policy JWT e dependências catalogadas antes de substituir a função. Se encontrar dependentes, aborta; o `DROP FUNCTION` usa `RESTRICT`, nunca `CASCADE`. A transação recria a função com nove colunas, concede à role restrita `SELECT` somente da coluna nova e deixa `EXECUTE` para `authenticated`, bloqueando `anon` e `PUBLIC`. Usa `SET SESSION AUTHORIZATION` e remove o `CREATE` temporário do schema, sem alterar a associação da role. Nenhuma policy é criada, removida ou alterada. O script precisa ser revisado e testado em ambiente isolado antes de qualquer aplicação; não foi executado no Supabase.

`docs/sql/PB13_verificacoes_identidade.sql` foi atualizado para comparar `total_apoios` da RPC com a coluna original nos dois formatos JWT e verificar que uma segunda conta com ocorrência própria não consegue consultar a ocorrência da primeira, tanto pela RPC quanto pela policy. Esse script SQL também não foi executado. A validação integrada real permanece pendente até revisão e execução autorizada em ambiente de teste com duas contas.
