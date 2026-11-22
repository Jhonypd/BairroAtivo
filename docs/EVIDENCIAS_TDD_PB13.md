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

O relatório do Expo Doctor continua com uma verificação reprovada por dependências fora das versões recomendadas. Na revisão original, a dependência incremental da RPC ainda estava pendente; ela foi aplicada e validada em 22/11/2026, conforme registrado abaixo. Nenhum merge foi realizado nesta sessão.

## Validação adicional — 22/11/2026

| Verificação | Resultado |
|---|---|
| `npm test -- --runInBand` | Passou: 19 suítes, 103 testes. |
| `npm run lint` | Passou, sem erros nem alertas. |
| `npm run typecheck` | Passou (`tsc --noEmit`). |
| `git diff --check` | Passou. |
| Supabase: metadados da tabela | `howviii.ocorrencias.total_apoios` continua `integer`, padrão `0`; RLS está ativa. |
| Supabase: RPC PB13 instalada | A função ainda retorna oito colunas, sem `total_apoios`. A role proprietária é sem login, `NOINHERIT` e sem `BYPASSRLS`; `search_path` está vazio. `authenticated` pode executar e `anon` não. Não foram encontradas dependências registradas. |
| Supabase: policy PB13 | A policy de leitura da role proprietária está ativa e compara a identidade usando `request.jwt.claim.sub` ou `request.jwt.claims`. |
| Supabase: ensaio somente de leitura | Passaram as verificações dos dois formatos de claim, identidade sem ocorrências, chamada sem identidade e bloqueio de `anon`. A transação terminou com `ROLLBACK`; nenhum registro foi alterado. |
| Supabase: duas contas distintas | Validado após o cadastro da segunda ocorrência: três ocorrências, dois autores distintos. O ensaio autenticado confirmou que cada conta recebe a própria ocorrência e não recebe a ocorrência alheia. |
| Migração de `total_apoios` | Aplicada ao Supabase ADS-UNIVALI e registrada como versão `20261122132655`. A RPC retorna nove colunas; a role proprietária tem `SELECT` em `total_apoios`, sem manter `CREATE` no schema. RLS e policy foram preservadas. |

A aplicação cliente e os testes existentes já incluem o mapeamento de `total_apoios`; a RPC agora também devolve essa contagem. Não usar a migração de instalação inicial nem a correção antiga de claims para substituir a RPC instalada.

## Observações do ensaio final — 22/11/2026

O roteiro completo `docs/sql/PB13_verificacoes_identidade.sql` não concluiu a etapa de teste direto da policy: o `postgres` gerenciado pelo Supabase não permite `SET SESSION AUTHORIZATION` para a role proprietária. O ensaio equivalente pela RPC, como `authenticated`, passou para as duas contas, incluindo conferência de `total_apoios`; a policy e suas permissões foram confirmadas por metadados. Todas as verificações comportamentais terminaram em transação com `ROLLBACK`, sem alterar ocorrências.

O advisor de segurança continua sinalizando que a RPC `SECURITY DEFINER` pode ser chamada por `authenticated`. Esse acesso é intencional para a lista pessoal, está limitado à role proprietária sem `BYPASSRLS`, usa policy de identidade e permanece negado a `anon`.
