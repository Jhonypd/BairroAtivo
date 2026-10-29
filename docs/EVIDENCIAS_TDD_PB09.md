# Evidências de TDD — PB09

Os registros abaixo descrevem comandos efetivamente executados durante a implementação. Os testes usam mocks locais; não validam credenciais, rede, políticas RLS ou execução em dispositivo.

## Conversão e consulta pública

### Red

Comando: `npm test -- --runInBand src/features/ocorrencias/__tests__/ocorrenciasSupabase.test.ts`

Resultado: falhou como esperado porque `../services/ocorrenciasSupabase` ainda não existia.

### Green

Após implementar conversão de status/categoria/data, consulta com lista vazia, erros, ordenação e projeção explícita dos campos, o comando direcionado passou. Durante o ajuste, o teste revelou o formato do locale `pt-BR` (`28 de out. de 2026`), que foi alinhado à expectativa.

### Refactor

Os filtros de título, bairro, categoria e status foram adicionados ao serviço e cobertos por teste. Após as mudanças finais, `npm test -- --runInBand` concluiu com **4 suítes aprovadas, 14 testes aprovados**.

## Segurança da seleção

O teste verifica que a chamada `.select()` especifica `id,titulo,descricao,categoria,bairro,status,criado_em,nome_publico`, sem `select('*')` nem `autor_id`. A conversão inclui o nome público somente quando preenchido.

## Verificação do banco

Verificação SQL read-only em 29/10/2026 confirmou que `howviii.ocorrencias` tem RLS habilitado e política `SELECT` para `anon` e `authenticated`. A política de linhas usa condição `true`, e os privilégios por coluna foram verificados separadamente: `has_column_privilege` retornou `false` para `anon` e `authenticated` na coluna `autor_id`. Nenhuma tabela, policy ou migration foi alterada nesta tarefa.

Uma chamada HTTP GET real à Data API, com a chave publishable e cabeçalho de schema `howviii`, retornou HTTP 200 e zero registros em `29/10/2026`. Isso confirma a consulta pública real ao schema vazio; não substitui validação da tela em emulador ou dispositivo.

## Tela de detalhes sem identificador

### Red

Comando: `npm test -- --runInBand src/features/ocorrencias/__tests__/PaginaDetalheOcorrencia.test.tsx`

Resultado: 3 cenários passaram (carregamento, erro e registro inexistente) e o cenário de ID ausente falhou porque a tela continuava exibindo o indicador de carregamento.

### Green / Refactor

A tela passou a exibir `Identificador da ocorrência inválido` sem consultar o serviço quando o parâmetro está ausente. Resultado final: **1 suíte aprovada, 4 testes aprovados**, cobrindo carregamento, erro de consulta, ocorrência inexistente e ID ausente. As verificações completas terminaram com 4 suítes e 14 testes aprovados, typecheck aprovado e lint aprovado.
