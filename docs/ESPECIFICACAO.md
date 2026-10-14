# BairroAtivo — Especificação de Requisitos (PB02)

**Versão:** 0.2 — requisitos revisados  
**Disciplina:** Hands On Work VIII — UNIVALI  
**Situação:** requisitos revisados após levantamento exploratório com moradores; a implementação completa está prevista para a Etapa 2.  
**Acesso:** qualquer pessoa pode consultar ocorrências. Para cadastrar ou gerenciar registros, será necessário entrar com uma conta Google.

## 1. Problema e justificativa

A ideia do BairroAtivo é reunir em um aplicativo problemas encontrados nos bairros, como buracos nas ruas, iluminação danificada e descarte irregular de lixo. Foi realizado um questionário exploratório com nove moradores, entre 10 e 14/10/2026. Oito indicaram buracos nas ruas e cinco apontaram calçadas danificadas; sete afirmaram que utilizariam o aplicativo e dois responderam 'talvez'. Esses dados ajudam a orientar as prioridades, mas não são representativos de toda a população de Brusque.

O aplicativo vai permitir cadastrar e consultar ocorrências. Ele não será um canal oficial da prefeitura e não vai garantir que os problemas sejam resolvidos.

## 2. Objetivos

**Geral:** desenvolver e testar um aplicativo mobile para registrar e acompanhar problemas encontrados nos bairros.

**Específicos:** permitir consultas sem login; exigir conta para criar e gerenciar registros; incluir fotos, mapa, filtros e notificações; testar as principais funcionalidades e avaliar o aplicativo com moradores.

## 3. Stakeholders

- **Moradores visitantes:** visualizam ocorrências públicas sem login.
- **Moradores cadastrados:** criam e gerenciam suas ocorrências.
- **Responsável pelo desenvolvimento:** cuida da programação, dos testes e da documentação do projeto.
- **Representantes comunitários:** potenciais participantes da validação.
- **Órgãos públicos:** podem ter interesse nas informações, mas não participam do projeto e não recebem registros automaticamente.

## 4. Requisitos funcionais

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RF01 | Consultar lista pública de ocorrências | Alta |
| RF02 | Visualizar detalhes públicos de uma ocorrência | Alta |
| RF03 | Filtrar ocorrências por bairro, categoria e status | Alta |
| RF04 | Visualizar ocorrências em mapa com marcadores | Alta |
| RF05 | Entrar com Google e sair da conta pelo Supabase Auth | Alta |
| RF06 | Cadastrar ocorrência com título, descrição, categoria, bairro e localização | Alta |
| RF07 | Anexar fotografia à ocorrência, com permissões apropriadas | Alta |
| RF08 | Editar e excluir apenas ocorrências próprias, mediante autenticação | Alta |
| RF09 | Consultar status: Aberta, Em acompanhamento, Resolvida | Alta |
| RF10 | Permitir ao autor autenticado atualizar o status da própria ocorrência, identificado como acompanhamento comunitário | Média |
| RF11 | Emitir notificações locais relevantes, mediante consentimento | Baixa |
| RF12 | Exibir as próprias ocorrências em área de gerenciamento | Alta |

### 4.1 Requisitos não funcionais

- **RNF01 — Plataforma:** aplicativo React Native com Expo e TypeScript; Android como plataforma mínima de demonstração, com atenção à compatibilidade iOS.
- **RNF02 — Segurança:** usar Supabase Auth com login Google (OAuth); aplicar Row Level Security (RLS) para impedir que um usuário altere dados de outro; nunca colocar service role key no aplicativo.
- **RNF03 — Privacidade:** evitar coletar endereço residencial desnecessário; localização é a do problema, sujeita à revisão pelo usuário; cuidado com pessoas, placas e dados pessoais nas fotos.
- **RNF04 — Usabilidade:** interface em português, estados vazios, mensagens de erro claras, feedback de carregamento e controles acessíveis.
- **RNF05 — Resiliência:** tratar rede indisponível, permissões recusadas, falhas de upload e dados inválidos sem travar o app.
- **RNF06 — Qualidade:** regras centrais cobertas por testes unitários e de integração; documentar ciclos TDD Red–Green–Refactor.
- **RNF07 — Rastreabilidade:** mudanças vinculadas a cartões Trello, commits GitHub e evidências reproduzíveis.
- **RNF08 — Transparência:** exibir aviso de que o projeto não é serviço oficial da prefeitura; status não equivale a atendimento oficial.

## 5. Regras de negócio

- **RN01:** visitante sem login pode consultar ocorrências publicadas, mas não criar, editar ou excluir. Para essas ações, o aplicativo solicitará login com Google.
- **RN02:** cadastro de ocorrência exige sessão válida e os campos obrigatórios preenchidos.
- **RN03:** cada ocorrência pertence ao usuário criador (identificado pelo ID do Supabase Auth).
- **RN04:** apenas o proprietário pode editar ou excluir sua ocorrência; a restrição deve ser aplicada também no banco via RLS.
- **RN05:** a seleção de foto e as permissões de câmera/galeria são opcionais; recusa de permissão não bloqueia consulta nem cadastro sem foto, se admitido pelo formulário.
- **RN06:** se o usuário recusar geolocalização, poderá informar bairro e selecionar posição manualmente no mapa antes de publicar.
- **RN07:** o status inicial será 'Aberta'. O autor autenticado poderá alterar o status de sua própria ocorrência para 'Em acompanhamento' ou 'Resolvida'. São informações comunitárias e não comprovam recebimento, providência ou conclusão por parte da prefeitura.
- **RN08:** notificações dependem de consentimento e disponibilidade do dispositivo; push remoto não é requisito obrigatório do MVP.
- **RN09:** registros de demonstração não devem conter dados pessoais reais sem necessidade e autorização.
- **RN10:** acesso público limita-se aos campos aprovados para exposição; e-mail e identificadores de autenticação não são exibidos.

## 6. Escopo e limites

**Incluído no MVP:** consulta pública e login com Google pelo Supabase Auth, cadastro/consulta/edição/exclusão autorizada, fotos, mapa/localização, filtros, status comunitário, notificações locais, testes e validação.

**Fora do escopo:** integração com prefeitura, encaminhamento oficial, exportação e envio automático de relatórios, garantia de resolução, chat, avaliações públicas de moradores, pagamentos, moderação avançada, painel administrativo complexo e push remoto em produção.

**Pontos pendentes:** testar o fluxo de login com Google no Expo em dispositivo físico e configurar corretamente os redirecionamentos OAuth. Definir como será feita a publicação, a moderação mínima e o prazo de retenção das fotografias. Verificar também os limites dos serviços utilizados.

## 7. Critérios de aceitação essenciais

1. Visitante abre lista, mapa e detalhes sem login.
2. Visitante recebe solicitação de login antes de criar ou gerenciar ocorrência.
3. Usuário autenticado cria ocorrência válida; dados obrigatórios ausentes geram erro.
4. Ocorrência salva aparece na lista e no mapa quando possui coordenadas.
5. Dono pode editar/excluir; usuário diferente não consegue executar a ação, inclusive por chamada direta ao backend.
6. Foto válida pode ser anexada; falhas de upload e permissões recusadas são tratadas.
7. Filtros retornam resultados coerentes, inclusive quando não há ocorrências.
8. Notificação local ocorre apenas com permissão e gatilho aplicável.
9. Testes automatizados das regras essenciais passam; há registro de ciclos TDD.
10. Resultados de validação com moradores são documentados com método, amostra real e limitações.

## 8. Métricas de sucesso

- Cobrir automaticamente as regras de autenticação/autorização, validação de cadastro e filtragem.
- Obter execução bem-sucedida dos cenários de aceitação essenciais no ambiente de testes.
- Realizar teste de usabilidade com moradores voluntários e registrar suas percepções.
- Medir tarefas concluídas, dificuldades encontradas e sugestões coletadas durante a validação.
- Manter rastreabilidade entre requisitos, cartões PB e evidências dos testes.

## 9. Planejamento de releases

- **Release 0.1 — 25/10/2026:** estrutura Expo, navegação/protótipo inicial, escopo, Scrum e primeiros testes demonstráveis; relatório e vídeo da Etapa 1.
- **Release 1.0 — 30/11/2026:** MVP funcional, testes, validação comunitária, relatório final e vídeo da Etapa 2.

## 10. Organização do projeto

O Trello é utilizado para acompanhar tarefas e sprints. O GitHub reúne o código-fonte, os requisitos e as evidências técnicas. Os resultados exploratórios do PB01 foram considerados na revisão do escopo e são descritos de forma consolidada no relatório parcial.

### 10.1 Possibilidade de evolução: exportação de ocorrências

Poderá ser desenvolvida uma rotina para gerar planilhas Excel com ocorrências elegíveis, contendo código, categoria, bairro, descrição, localização, data e status comunitário. Em uma etapa posterior, poderá ser avaliado o envio periódico desses relatórios por e-mail a um canal institucional autorizado da prefeitura.

Não há integração, parceria ou encaminhamento oficial implementado. Uma futura solução deverá minimizar dados pessoais, impedir envio duplicado e registrar os envios efetivos. Um registro não poderá ser apresentado como encaminhado apenas por ter sido incluído numa planilha.

## 11. Pendências

- Evidência da pesquisa PB01: nove respostas ao questionário https://forms.cloud.microsoft/r/E0ed0xag4N, com planilha preservada no cartão do Trello.
- Confirmar com o professor autorização excepcional para entrega individual, pois o enunciado exige grupo.
- Definir regras de publicação e retenção das fotos antes da implementação.
- Avaliar canal institucional de recebimento apenas se a futura exportação por Excel vier a ser desenvolvida.
