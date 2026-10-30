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

Os testes do serviço verificam a abertura do navegador, deep link, troca do código PKCE pela sessão e cancelamento. A rota de callback também cobre carregamento durante a troca PKCE, redirecionamento após sucesso, erro retornado pelo provedor, código ausente e falha na troca. O teste da listagem confirma que visitantes continuam acessando as ocorrências públicas.

Comandos finais executados:

```bash
npm test -- --runInBand
npm run typecheck
npm run lint
npx expo-doctor
```

Resultados desta continuação: **9 suítes aprovadas, 33 testes aprovados**; typecheck aprovado; lint aprovado sem avisos; Expo Doctor aprovado com **20/20 verificações**. O armazenamento móvel da sessão usa `expo-secure-store`; o mock correspondente é configurado para executar os testes sem módulo nativo.

## Verificação externa pendente

O usuário confirmou que o provedor Google, Client ID, Client Secret e o redirect `bairroativo://auth/callback` já estão configurados no Supabase. A URL Supabase e a chave publicável foram cadastradas no ambiente `development` do EAS; o Client Secret do Google não é enviado ao aplicativo. O retorno OAuth deve ser validado em development build iOS/Android; Expo Go não permite validar esse deep link nativo. Esta máquina não tem Android conectado nem simulador iOS configurado. O build de desenvolvimento Android está em execução no EAS. O build iOS depende de credenciais de assinatura/distribuição Apple para o perfil interno.
