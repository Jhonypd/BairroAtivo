# Evidências TDD — PB13

## Escopo e estado

A PB13 permite consultar as ocorrências próprias, editar os campos permitidos pelo formulário existente e excluir uma ocorrência após confirmação. Visitantes não acessam a lista pessoal; operações de edição e exclusão são oferecidas somente nessa lista. O serviço consulta `howviii.listar_minhas_ocorrencias()` para evitar expor `autor_id` por uma leitura comum da tabela.

O aplicativo mostra o total de apoios nos cards públicos e pessoais e nos detalhes. A consulta comum inclui `total_apoios`; `converterOcorrencia` mapeia o campo para `totalApoios`. A RPC pessoal era documentada com oito colunas, sem esse campo, portanto é necessário incluí-lo para os cards pessoais exibirem a mesma contagem. A proposta incremental adiciona a nona coluna e concede à role proprietária somente `SELECT` dessa coluna.

O responsável informou que a função instalada já foi corrigida para interpretar `request.jwt.claim.sub` e `request.jwt.claims`. A role `bairroativo_pb13_rpc_owner`, `SECURITY DEFINER`, RLS e os privilégios existentes devem ser preservados. A proposta incremental verifica esses pré-requisitos, mantém a policy existente sem recriá-la e conserva `EXECUTE` para `authenticated`, negado a `anon` e `PUBLIC`. Não chama `auth.uid()`.

`docs/sql/PB13_listar_minhas_ocorrencias.sql` é referência de instalação inicial; não executar sobre a RPC instalada. `docs/sql/PB13_corrigir_claims_minhas_ocorrencias_incremental.sql` registra a correção anterior de claims; também não executar novamente. Para adicionar a coluna de retorno, revisar somente `docs/sql/PB13_adicionar_total_apoios_rpc_incremental.sql`.

## Validação da aplicação — 12/11/2026

Os seguintes resultados são desta revisão; nenhum teste é declarado aprovado sem execução:

| Verificação | Resultado |
|---|---|
| `npm test -- --runInBand` | Passou: 19 suítes, 103 testes. |
| `npm run lint` | Passou, sem erros nem alertas. |
| `npm run typecheck` | Passou (`tsc --noEmit`). |
| `npx expo-doctor` | 19/20 verificações. Falhou apenas compatibilidade de versões: `react-native-safe-area-context` 5.10.1 vs. ~5.11.1; divergências de patch em `@expo/ui`, `expo`, `expo-blur`, `expo-constants`, `expo-dev-client`, `expo-font`, `expo-linking`, `expo-router`, `expo-secure-store`, `expo-splash-screen`, `expo-status-bar`, `expo-symbols`, `expo-web-browser` e `jest-expo`. Nenhuma dependência foi alterada. |
| `npx expo export --platform web` | Passou: exportou 12 rotas estáticas, incluindo `/ocorrencias/editar/[id]`; o teste movido não aparece como rota. Metro descartou um cache ilegível e refez a varredura antes de exportar. |
| `git diff --check` | Passou. |

Os testes de terceiro no cliente simulam respostas negadas/falhas e não comprovam RLS. O responsável informou que testou manualmente listagem pessoal, edição, exclusão e bloqueio de operações em ocorrências de outros usuários; não repetimos esse ensaio nesta revisão.

## Banco e SQL

Em 12/11/2026, uma leitura somente de metadados confirmou que `howviii.ocorrencias.total_apoios` é `integer`, tem valor padrão `0` e a tabela está com RLS ativa. Não consultamos por SQL a definição instalada da RPC, sua ACL nem as dependências em `pg_depend`.

Por instrução, nenhum SQL foi executado e nenhum dado ou objeto foi alterado no Supabase. A migração incremental e `docs/sql/PB13_verificacoes_identidade.sql` não foram executados. O teste SQL requer ambiente de teste e duas contas distintas, cada uma com ao menos uma ocorrência. Até essa execução não há evidência integrada nova sobre retorno de `total_apoios`, ACL da função ou isolamento RLS entre contas.

Os registros mais antigos de grants e políticas foram removidos deste relatório porque não foram reconfirmados nesta revisão e não devem ser tratados como estado atual. A migração aborta se a definição, grants, policy ou role não corresponderem às pré-condições esperadas; não usa `CASCADE` e não altera políticas RLS.

## Revisão do PR #9

O PR #9 está aberto, direcionado a `1.0.0.0/1.0.0.0`. O GitHub informou que o branch era mergeável antes destas correções. A revisão apontou um teste dentro de `src/app`; ele foi movido para `src/features/ocorrencias/__tests__`. Também apontou que a tela permitia alternar apoio antes da consulta inicial terminar e não atualizava a contagem após a operação. A tela agora bloqueia o botão durante a consulta, ignora respostas obsoletas após desmontagem e atualiza a contagem local após operações bem-sucedidas. Os testes cobrem carregamento e contagem.

O relatório do Expo Doctor continua com uma verificação reprovada por dependências fora das versões recomendadas. A dependência incremental da RPC também precisa ser aplicada e validada em ambiente de teste antes de o aplicativo exibir a contagem correta nas ocorrências pessoais. Como SQL e Supabase não foram alterados nesta revisão, o PR não fica pronto para merge até essa validação e a atualização correspondente da RPC.
