# Evidências TDD — PB06

O ciclo foi executado na branch `feat/pb06-testes-tdd`, a partir da `main` atualizada (`6743868`). Os commits RED, GREEN e REFACTOR são consecutivos e preservam o estado verificável de cada etapa.

## RED

**Commit:** `d451aac` — `test: inicia ciclo RED para título obrigatório`

Os testes foram escritos primeiro para título vazio, somente espaços e título preenchido. A primeira execução, antes de existir o módulo importado, falhou ao carregar a suíte (`Cannot find module`, 0 testes executados). Para observar a falha das próprias asserções, o estado RED usa uma função provisória que aceita qualquer título, sem aplicar a regra.

**Comando:**

```bash
npm test -- --runInBand src/features/ocorrencias/__tests__/tituloObrigatorio.test.ts
```

**Resultado observado:** `Test Suites: 1 failed, 1 total`; `Tests: 2 failed, 1 passed, 3 total`. Os casos vazio e somente espaços receberam `true`, embora esperassem `false`; o título preenchido passou.

## GREEN

**Commit:** `32fbea7` — `feat: valida título obrigatório da ocorrência`

A função passou a aplicar `trim()` e verificar se resta conteúdo.

**Comando:**

```bash
npm test -- --runInBand src/features/ocorrencias/__tests__/tituloObrigatorio.test.ts
```

**Resultado observado:** `Test Suites: 1 passed, 1 total`; `Tests: 3 passed, 3 total`.

## REFACTOR

**Commit:** `fe78bda` — `refactor: explicita normalização do título`

A normalização foi nomeada em uma variável local para deixar a regra mais clara; o comportamento permaneceu igual.

**Comando:**

```bash
npm test -- --runInBand src/features/ocorrencias/__tests__/tituloObrigatorio.test.ts
```

**Resultado observado:** `Test Suites: 1 passed, 1 total`; `Tests: 3 passed, 3 total`.

## Testes de interface e verificações finais

O commit `a5be299` adiciona um teste do componente `Botao`, verificando o rótulo acessível e a navegação para `/ocorrencias`.

Comando final `npm test -- --runInBand`: `Test Suites: 2 passed, 2 total`; `Tests: 4 passed, 4 total`.

Também passaram `npm run typecheck`, `npm run lint` e `npx expo-doctor` (`21/21 checks passed`).

O commit `d36efd6` configura Jest e Testing Library. O commit `3d8702e` alinha as dependências à linha do Expo SDK 57; esse ajuste inclui corrigir o `expo-router` 58 encontrado na `main`, usar o Router 57 e manter os módulos nativos deduplicados.
