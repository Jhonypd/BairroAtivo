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

Resultados desta continuação: **10 suítes aprovadas, 35 testes aprovados**; typecheck aprovado; lint aprovado sem avisos; Expo Doctor aprovado com **20/20 verificações**. O armazenamento móvel da sessão usa `expo-secure-store`; o mock correspondente é configurado para executar os testes sem módulo nativo.

## Verificação externa pendente

O usuário confirmou que o provedor Google, Client ID, Client Secret e o redirect `bairroativo://auth/callback` já estão configurados no Supabase. A URL Supabase e a chave publicável foram cadastradas no ambiente `development` do EAS; o Client Secret do Google não é enviado ao aplicativo. O teste via Expo Go no iPhone mostrou “Safari can’t open…” porque o Expo Go não registra o esquema nativo `bairroativo://`. O app agora identifica o Expo Go e mostra uma orientação antes de abrir o navegador. A configuração introspectada do app inclui `bairroativo` em `CFBundleURLTypes`. A validação real deve ser repetida numa development build iOS; o EAS ainda depende de credenciais Apple para assinar/distribuir essa build. O build Android está em execução e esta máquina não tem aparelho Android conectado.
