# BairroAtivo

**Um aplicativo para visualizar e registrar problemas encontrados nos bairros.**

O BairroAtivo é um projeto de aplicativo mobile desenvolvido com **React Native, Expo e TypeScript**. A proposta é reunir, em um só lugar, relatos sobre problemas de infraestrutura urbana — como buracos nas ruas, iluminação danificada, calçadas em más condições e descarte irregular de lixo — para facilitar a consulta e o acompanhamento pela comunidade.

O projeto faz parte da disciplina **Hands On Work VIII**, do curso de **Análise e Desenvolvimento de Sistemas da UNIVALI**.

> **Importante:** o BairroAtivo é um projeto acadêmico independente. Não é um serviço oficial da prefeitura, não encaminha solicitações automaticamente a órgãos públicos e não garante a resolução dos problemas registrados.

## Baixar o aplicativo

O protótipo da primeira etapa está disponível para **Android**. O APK foi gerado com Expo EAS Build e testado em dispositivo físico.

**[Baixar APK pelo GitHub Releases](https://github.com/Jhonypd/BairroAtivo/releases/tag/BairroAtivo)**

Na página da Release, basta localizar a seção **Assets** e baixar o arquivo com extensão `.apk`. Em seguida, abra o arquivo no Android para instalar o aplicativo. Dependendo das configurações do aparelho, pode ser necessário autorizar a instalação de aplicativos dessa origem.

A versão disponibilizada na Release da Etapa 1 é demonstrativa e utiliza **dados simulados**, sem conexão com banco de dados. O código atual em `develop` iniciou a integração pública com Supabase.

## Funcionalidades do protótipo

No APK da Release da Etapa 1, é possível:

- Navegar pelas telas do aplicativo;
- Consultar uma lista de ocorrências de exemplo;
- Visualizar os detalhes de uma ocorrência;
- Pesquisar e filtrar os registros apresentados;
- Acessar o formulário demonstrativo de ocorrência.

**Ainda não estão implementados:** autenticação com Google, publicação e persistência de ocorrências, envio de fotografias, mapa integrado e notificações.

No código atual em `develop`, a listagem e os detalhes consultam ocorrências públicas no Supabase, com pesquisa/filtros, ordenação recente e estados de carregamento, erro e lista vazia. Os testes usam mocks e não comprovam a autorização do banco nem a conexão em dispositivo.

## Pesquisa com a comunidade

Antes do desenvolvimento, foi realizado um questionário exploratório com **nove participantes**, entre 10 e 14 de outubro de 2026, para identificar dificuldades relacionadas à infraestrutura dos bairros.

Entre as respostas:

- **8 de 9** participantes mencionaram buracos nas ruas;
- **5 de 9** apontaram calçadas danificadas;
- **7 de 9** disseram que utilizariam um aplicativo com essa finalidade, e **2** responderam que talvez utilizassem.

Os resultados contribuíram para definir os requisitos e as prioridades do projeto. Por se tratar de uma amostra pequena, não representam a opinião de toda a população de Brusque.

## Tecnologias utilizadas

| Tecnologia | Finalidade |
| --- | --- |
| React Native | Desenvolvimento da interface mobile |
| Expo | Ambiente de desenvolvimento e compilação do aplicativo |
| TypeScript | Tipagem e organização do código |
| Expo Router | Navegação e estrutura de rotas |
| Jest | Execução dos testes automatizados |
| React Native Testing Library | Testes de componentes e comportamentos da interface |
| EAS Build | Geração do APK Android |
| GitHub | Versionamento e disponibilização do código |
| Trello | Organização das tarefas e acompanhamento do desenvolvimento |

O projeto integra `@supabase/supabase-js` ao schema `howviii` para consulta pública de ocorrências. A autenticação permanece planejada.

### Configurar a conexão local

Copie `.env.example` para `.env` e preencha `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` com a chave publishable do projeto Supabase. O `.env` está ignorado pelo Git. Nunca utilize uma chave `service_role` no aplicativo.

As políticas RLS existentes permitem `SELECT` público em todas as colunas de `howviii.ocorrencias`. O app solicita somente os campos públicos aprovados, mas essa política não impede clientes de requisitarem `autor_id` diretamente. Ajuste a política no Supabase para expor somente campos públicos antes de depender desta configuração em produção.

## Desenvolvimento e testes

O projeto utiliza práticas de **desenvolvimento orientado a testes (TDD)**, seguindo o ciclo *Red → Green → Refactor*: definir o comportamento esperado em um teste, implementar a solução necessária e refatorar mantendo os testes aprovados.

Na primeira etapa, foram registradas **duas suítes com quatro testes automatizados aprovados**, além de verificações de tipos, lint e testes manuais de navegação.

Para executar as verificações localmente:

```bash
npm test
npm run typecheck
npm run lint
npx expo-doctor
```

As evidências dos ciclos de teste estão documentadas em [EVIDENCIAS_TDD_PB06.md](docs/EVIDENCIAS_TDD_PB06.md).

## Como executar o projeto

### Pré-requisitos

- Node.js compatível com o Expo SDK utilizado (recomendado Node.js 22.13 ou superior);
- npm;
- Expo Go instalado no celular ou um emulador configurado.

### Instalação

```bash
git clone https://github.com/Jhonypd/BairroAtivo.git
cd BairroAtivo
npm install
```

### Execução

```bash
npm start
```

Leia o QR code exibido no terminal usando o Expo Go.

Também estão disponíveis os comandos:

```bash
npm run android
npm run ios
npm run web
```

Os ambientes Android e iOS exigem dispositivo ou emulador configurado. Para executar o simulador iOS, é necessário macOS.

### Gerar um APK Android

O projeto já possui um perfil `preview` no `eas.json`, configurado para gerar um APK:

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

O processo exige uma conta Expo autenticada e gera um link para baixar o arquivo ao final da compilação.

## Organização do código

```text
src/
├── app/              # Rotas e layouts do Expo Router
├── features/
│   ├── inicio/       # Tela inicial
│   ├── autenticacao/ # Estrutura para o acesso de usuários
│   └── ocorrencias/  # Telas, componentes e dados simulados
├── shared/           # Componentes reutilizáveis
└── configs/          # Tema e configurações gerais
```

Os testes ficam próximos às respectivas funcionalidades, em diretórios `__tests__`.

## Próximos passos

O desenvolvimento continuará com o objetivo de permitir:

- Login com Google;
- Cadastro e gerenciamento de ocorrências por usuários autenticados;
- Consulta pública e área **Minhas ocorrências**;
- Publicação com opção de ocultar o nome do autor;
- Inclusão de fotos e visualização em mapa;
- Apoio a ocorrências, limitado a um por usuário em cada registro;
- Autenticação e gravação de dados no Supabase;
- Ampliação dos testes automatizados e validação com usuários.

Esses itens são **funcionalidades planejadas**, não recursos disponíveis no APK atual.

## Planejamento e documentação

O desenvolvimento é acompanhado por cartões, sprints e tarefas no Trello. O repositório concentra o código-fonte e a documentação técnica.

- [Quadro do projeto no Trello](https://trello.com/b/xIG5oXo2/hands-on-work-viii)
- [Especificação de requisitos](docs/ESPECIFICACAO.md)
- [Evidências de TDD](docs/EVIDENCIAS_TDD_PB06.md)
- [Release do protótipo Android](https://github.com/Jhonypd/BairroAtivo/releases/tag/BairroAtivo)

---

Desenvolvido por **Jhony Pereira Duarte** — Análise e Desenvolvimento de Sistemas, **UNIVALI**.
