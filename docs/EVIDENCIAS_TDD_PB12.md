# Evidências de TDD — PB12

## Red

Antes de implementar os seletores e a combinação dos filtros, executei:

```bash
npm test -- --runInBand --verbose src/features/ocorrencias/__tests__/PaginaOcorrenciasFiltros.test.tsx
```

A suíte falhou porque a listagem ainda não apresentava controles de bairro e categoria. A ordenação existente e a diferenciação entre lista vazia e erro permaneceram cobertas pelos testes anteriores.

## Green

Após acrescentar os filtros locais e reaproveitar `CampoSelecao`, executei a suíte PB12:

```bash
npm test -- --runInBand --verbose src/features/ocorrencias/__tests__/PaginaOcorrenciasFiltros.test.tsx
```

Resultado após a implementação inicial dos filtros: **1 suíte aprovada, 10 testes aprovados**. A cobertura verifica seleção de bairro e categoria a partir dos registros carregados, combinação com status e busca textual, limpeza dos filtros, ausência de correspondências, lista sem registros, ordenação e falha de conexão. Também simula uma atualização manual mais nova terminando antes da consulta inicial e confirma que a resposta antiga não substitui os registros atuais.

Um teste adicional foi escrito antes do banner de erro de atualização e executado isoladamente:

```bash
npm test -- --runInBand --verbose src/features/ocorrencias/__tests__/PaginaOcorrenciasFiltros.test.tsx -t "mantém os resultados e informa quando uma atualização falha"
```

Red: falhou porque a tela mantinha os registros anteriores sem informar que a atualização manual havia falhado. Green: depois de incluir a mensagem e a ação para tentar novamente, o teste isolado passou. A suíte PB12 agora contém 11 testes.

## Estratégia de consulta e segurança

Os filtros são locais porque a listagem já carrega o conjunto público de registros e o volume atual é pequeno. Alterações dos filtros não fazem chamadas de rede; busca, bairro, categoria e status são aplicados sobre o mesmo conjunto, sem risco de respostas de filtros diferentes chegarem fora de ordem. A carga inicial e a atualização manual usam um identificador sequencial para descartar uma resposta anterior se uma requisição mais nova já tiver começado. Para volumes maiores, será necessário paginar a consulta e transferir os filtros para o servidor.

A leitura continua usando `listarOcorrencias` e os campos públicos existentes, sem `autor_id`, chave administrativa ou mudança de schema/RLS. O serviço mantém a ordenação descendente por `criado_em`.

## Verificações finais

Resultados dos comandos completos solicitados:

```bash
npm test -- --runInBand
npm run typecheck
npm run lint
npx expo-doctor
```

Resultado: **11 suítes aprovadas, 46 testes aprovados**; typecheck aprovado; lint aprovado sem avisos; Expo Doctor aprovado com **20/20 verificações**.
