# Evidências de testes — PB15

## Contexto

Registro das verificações executadas em 22/11/2026 no workspace local da branch `develop`. A suíte automatizada usa mocks para integrações externas; os resultados abaixo não substituem testes manuais no Android nem comprovam autorização real entre contas.

## Regressão encontrada e correção do ambiente de teste

### Red — execução inicial

Comando:

```bash
npm test -- --runInBand
```

Resultado: **20 suítes aprovadas, 1 reprovada; 112 testes aprovados e 8 reprovados (120 no total)**. Os oito testes de `FormularioOcorrencia.test.tsx` falhavam ao renderizar o formulário com `Element type is invalid`. O formulário havia passado a renderizar `info_24dp_E3E3E3.svg`, mas esse ativo não estava isolado por mock no teste.

### Green — correção e nova execução

Foi adicionado ao teste do formulário um mock para `@/shared/icons/info_24dp_E3E3E3.svg`, seguindo o padrão já usado para os demais SVGs. Nenhum componente ou comportamento de produção foi alterado.

Validação focada:

```bash
npm test -- --runInBand src/features/ocorrencias/__tests__/FormularioOcorrencia.test.tsx
```

Resultado: **1 suíte aprovada, 8 testes aprovados**.

Validação completa após a correção:

```bash
npm test -- --runInBand
npm run lint
npm run typecheck
```

Resultados: **21 suítes aprovadas, 120 testes aprovados**; lint aprovado; typecheck (`tsc --noEmit`) aprovado.

### Refactor

A correção ficou restrita ao arranjo do teste: SVGs importados são substituídos por componentes nulos no ambiente Jest. Isso remove a dependência do transformer de SVG para testar a lógica do formulário. Não houve refatoração de lógica funcional neste ciclo, portanto este resultado não é apresentado como ciclo Red–Green–Refactor de uma regra de negócio.

## Verificações manuais pendentes

A lista de dispositivos de `adb devices -l` estava vazia. O comando `emulator -list-avds` não está disponível neste ambiente. Portanto, permanecem sem execução nesta PB15 os cenários manuais Android mencionados no cartão, incluindo edição/exclusão, tratamento de falha/recarregamento e isolamento entre duas contas reais.

## Reprodutibilidade

Executar os comandos da seção Green na raiz do projeto com as dependências instaladas. Para validar cenários Android, conectar um aparelho com depuração USB ou disponibilizar um AVD e uma development build configurada.