# BairroAtivo

Aplicativo mobile em React Native, Expo e TypeScript para consultar relatos comunitários e demonstrar o cadastro de problemas encontrados nos bairros.

## Requisitos

- Node.js 22.13 ou superior (linha LTS recomendada pelo Expo SDK 57).
- npm 10 ou superior.
- Expo Go em um dispositivo Android/iOS ou um emulador configurado. Para iOS Simulator é necessário macOS.

## Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/Jhonypd/BairroAtivo.git
cd BairroAtivo
npm install
```

## Executar

Inicie o servidor de desenvolvimento:

```bash
npm start
```

Leia o QR code com o Expo Go ou use os atalhos exibidos no terminal. Também é possível executar diretamente:

```bash
npm run android
npm run ios
npm run web
```

Os comandos Android e iOS precisam de um dispositivo ou emulador configurado; o simulador iOS requer macOS.

## Verificações

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

## Organização

- `src/app/`: rotas e layouts do Expo Router.
- `src/components/`: componentes visuais reutilizáveis.
- `src/styles/`: estilos específicos das telas, fora da pasta de rotas.
- `src/theme/`: cores e valores visuais compartilhados.
- `src/services/`: integrações e serviços futuros.
- `src/types/`: tipos compartilhados.
- `src/domain/`: regras de negócio.
- `tests/`: testes futuros.

O formulário e a lista usam dados simulados. Nenhum serviço externo está conectado nesta etapa.

## Tecnologias

- Expo SDK 57 e React Native 0.86.
- React 19 e TypeScript em modo estrito.
- Expo Router para navegação baseada em arquivos.

Não adicione credenciais ao repositório. Arquivos locais `.env` são ignorados pelo Git.
