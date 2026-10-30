# Evidências de TDD — PB09

## Consulta pública e tela de detalhes — evidências anteriores

Os registros abaixo descrevem comandos efetivamente executados durante a implementação anterior. Os testes usam mocks locais; não validam credenciais, rede, políticas RLS ou execução em dispositivo.

### Conversão e consulta pública

#### Red

Comando: `npm test -- --runInBand src/features/ocorrencias/__tests__/ocorrenciasSupabase.test.ts`

Resultado: falhou como esperado porque `../services/ocorrenciasSupabase` ainda não existia.

#### Green

Após implementar conversão de status/categoria/data, consulta com lista vazia, erros, ordenação e projeção explícita dos campos, o comando direcionado passou. Durante o ajuste, o teste revelou o formato do locale `pt-BR` (`28 de out. de 2026`), que foi alinhado à expectativa.

#### Refactor

Os filtros de título, bairro, categoria e status foram adicionados ao serviço e cobertos por teste. Após as mudanças finais daquela etapa, `npm test -- --runInBand` concluiu com **4 suítes aprovadas, 14 testes aprovados**.

### Segurança da seleção

O teste verifica que a chamada `.select()` especifica `id,titulo,descricao,categoria,bairro,status,criado_em,nome_publico`, sem `select('*')` nem `autor_id`. A conversão inclui o nome público somente quando preenchido.

### Verificação do banco

Verificação SQL read-only em 29/10/2026 confirmou que `howviii.ocorrencias` tem RLS habilitado e política `SELECT` para `anon` e `authenticated`. A política de linhas usa condição `true`, e os privilégios por coluna foram verificados separadamente: `has_column_privilege` retornou `false` para `anon` e `authenticated` na coluna `autor_id`. Nenhuma tabela, policy ou migration foi alterada naquela etapa.

Uma chamada HTTP GET real à Data API, com a chave publishable e cabeçalho de schema `howviii`, retornou HTTP 200 e zero registros em 29/10/2026. Isso confirma a consulta pública real ao schema vazio; não substitui validação da tela em emulador ou dispositivo.

### Tela de detalhes sem identificador

#### Red

Comando: `npm test -- --runInBand src/features/ocorrencias/__tests__/PaginaDetalheOcorrencia.test.tsx`

Resultado: 3 cenários passaram (carregamento, erro e registro inexistente) e o cenário de ID ausente falhou porque a tela continuava exibindo o indicador de carregamento.

#### Green / Refactor

A tela passou a exibir `Identificador da ocorrência inválido` sem consultar o serviço quando o parâmetro está ausente. Resultado final: **1 suíte aprovada, 4 testes aprovados**, cobrindo carregamento, erro de consulta, ocorrência inexistente e ID ausente. As verificações completas daquela etapa terminaram com 4 suítes e 14 testes aprovados, typecheck aprovado e lint aprovado.

## Escopo conferido antes do desenvolvimento

- O formulário era demonstrativo e mantinha o botão de cadastro desabilitado.
- `howviii.ocorrencias` já possuía as colunas e valores aceitos descritos na PB09; nenhuma migration, alteração de schema ou política foi necessária.
- A policy de INSERT exige `autor_id = auth.uid()` e `total_apoios = 0`. A coluna `autor_id` não concede SELECT aos papéis `anon` e `authenticated`; as colunas públicas usadas na resposta possuem SELECT.
- O cadastro usa a sessão ativa para preencher `autor_id`, omite `id`, `status`, `total_apoios` e datas, e retorna somente `id,titulo,descricao,categoria,bairro,status,criado_em,nome_publico`.

## Red

Antes da implementação do serviço e do validador:

```bash
npm test -- --runInBand src/features/ocorrencias/__tests__/cadastroOcorrencia.test.ts
```

Resultado observado: **1 suíte falhou**, pois `validacoes/cadastroOcorrencia` ainda não existia.

Antes de substituir o formulário demonstrativo:

```bash
npm test -- --runInBand src/features/ocorrencias/__tests__/FormularioOcorrencia.test.tsx
```

Resultado observado após corrigir o uso assíncrono do Testing Library: **5 testes falharam**. O formulário antigo não expunha os campos acessíveis esperados nem permitia concluir o cadastro; os testes de falha, sucesso, duplicidade e consentimento não conseguiam executar o fluxo.

Antes de refazer a consulta ao voltar para a lista:

```bash
npm test -- --runInBand src/features/ocorrencias/__tests__/PaginaOcorrenciasFiltros.test.tsx -t "atualiza os registros quando a tela volta a receber foco"
```

Resultado observado: **1 teste falhou** porque a consulta era chamada uma vez, em vez de ser chamada novamente quando a tela recebia foco.

## Green e refatoração

- O serviço e o validador passaram a cobrir autenticação ausente, falha ao validar sessão, erro do Supabase, limites do banco, associação ao usuário da sessão, tradução de categorias e retorno apenas de campos públicos.
- O formulário passou a validar e enviar os dados, bloquear submissões repetidas, preservar os campos em erro, pedir consentimento para publicar o nome e confirmar o sucesso com acesso à lista ou aos detalhes.
- A navegação abre a rota protegida de cadastro. A listagem usa `useFocusEffect` e descarta respostas anteriores quando perde foco, atualizando os registros quando o usuário retorna.
- O teste de retorno à lista passou após essa alteração. A suíte focada final passou com **6 suítes e 35 testes** durante a etapa de desenvolvimento.

## Verificações finais executadas

```bash
npm test -- --runInBand
npm run typecheck
npm run lint
npx expo-doctor
```

Resultados observados após as alterações finais:

- Jest: **14 suítes aprovadas, 68 testes aprovados**.
- Typecheck: aprovado.
- Lint: aprovado.
- Expo Doctor: **20/20 verificações aprovadas**.

## Limites da validação

As chamadas Supabase nos testes usam clientes simulados. Não foi criado um registro de teste no banco de produção nem executado um cadastro manual em aparelho Android neste ambiente. A confirmação de um cadastro real deve ser feita seguindo o roteiro manual informado na entrega da PB09.
