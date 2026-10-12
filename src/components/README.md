# Componentes

Componentes visuais que podem ser usados em mais de uma tela.

Cada componente mantém sua lógica em um arquivo `.tsx` e seus estilos em um arquivo `.styles.ts` correspondente. Cores compartilhadas ficam em `src/theme/`.

`ActionButton` centraliza os botões da interface. Use `primary` para a ação principal, `secondary` para ações importantes de apoio, `outline` para ações neutras, `ghost` para ações de baixa ênfase e `destructive` para ações que removem ou cancelam algo. `icon` cria um botão quadrado só com ícone e exige um rótulo de acessibilidade.

Os tamanhos disponíveis são `xs`, `sm`, `md` e `lg`. O componente aceita navegação por `href` ou uma ação por `onPress`, um ícone opcional ao lado do texto, `fullWidth` e o estado `disabled`. Prefira `md` como tamanho padrão; use `xs` e `sm` em espaços compactos e `lg` na chamada principal de uma tela.

`OccurrenceCard` exibe um relato simulado e abre seus detalhes. `FilterChip` mostra filtros selecionáveis e `SelectField` oferece uma lista de opções expansível para formulários.
