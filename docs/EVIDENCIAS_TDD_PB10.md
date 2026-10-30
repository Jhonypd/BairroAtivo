# Evidências de TDD — PB10

Os testes usam mocks locais. Não utilizam contas Google, tokens reais ou credenciais do Supabase, e não comprovam login em dispositivo.

## Estado de autenticação e proteção de acesso

### Red

Antes de implementar o provedor de autenticação, executei:

```bash
npm test -- --runInBand src/features/autenticacao/__tests__/AutenticacaoProvider.test.tsx
```

Resultado: a suíte falhou como esperado porque `../services/autenticacao` ainda não existia.

### Green

Após criar o serviço OAuth e o provedor global de autenticação, os testes cobriram:

- visitante enquanto a sessão inicial está sendo verificada e depois da restauração sem sessão;
- restauração de sessão válida;
- login bem-sucedido;
- cancelamento e erro de autenticação;
- logout;
- atualização quando a sessão muda;
- bloqueio de tentativas simultâneas;
- redirecionamento de visitante e acesso autenticado à rota protegida.

Os testes do serviço verificam a abertura do navegador, deep link, troca do código PKCE pela sessão e cancelamento. O teste da listagem confirma que visitantes continuam acessando as ocorrências públicas.

Comandos finais executados:

```bash
npm test -- --runInBand
npm run typecheck
npm run lint
npx expo-doctor
```

Resultados: **8 suítes aprovadas, 28 testes aprovados**; typecheck aprovado; lint aprovado sem avisos; Expo Doctor aprovado com **20/20 verificações**. O mock do AsyncStorage foi configurado para que o cliente Supabase possa ser carregado nos testes sem módulo nativo.

## Verificação externa pendente

O Client ID e o Client Secret do Google precisam ser configurados nos painéis Google Cloud e Supabase. O deep link `bairroativo://auth/callback` também precisa estar na lista de redirecionamentos permitidos do Supabase. O retorno OAuth deve ser validado em development build iOS/Android; Expo Go não permite validar esse deep link nativo.
