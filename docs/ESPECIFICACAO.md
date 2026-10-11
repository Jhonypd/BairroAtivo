# BairroAtivo — Especificação de Requisitos (PB02)

**Versão:** 0.1 — preliminar  
**Disciplina:** Hands On Work VIII — UNIVALI  
**Situação:** versão inicial. Alguns pontos serão ajustados depois de analisar as respostas da pesquisa.  
**Acesso:** qualquer pessoa pode consultar ocorrências. Para cadastrar ou gerenciar registros, será necessário login.

## 1. Problema e justificativa

A ideia do BairroAtivo é reunir em um aplicativo problemas encontrados nos bairros, como buracos nas ruas, iluminação danificada e descarte irregular de lixo. Preparei uma pesquisa para entender melhor as dificuldades dos moradores e ainda estou aguardando as respostas.

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
| RF05 | Criar conta, autenticar-se e encerrar sessão | Alta |
| RF06 | Cadastrar ocorrência com título, descrição, categoria, bairro e localização | Alta |
| RF07 | Anexar fotografia à ocorrência, com permissões apropriadas | Alta |
| RF08 | Editar e excluir apenas ocorrências próprias, mediante autenticação | Alta |
| RF09 | Consultar status: Aberta, Em acompanhamento, Resolvida | Alta |
| RF10 | Permitir atualização autorizada de status com regras explícitas | Média |
| RF11 | Emitir notificações locais relevantes, mediante consentimento | Média |
| RF12 | Exibir as próprias ocorrências em área de gerenciamento | Alta |

### 4.1 Requisitos não funcionais

- **RNF01 — Plataforma:** aplicativo React Native com Expo e TypeScript; Android como plataforma mínima de demonstração, com atenção à compatibilidade iOS.
- **RNF02 — Segurança:** usar Supabase Auth; aplicar Row Level Security (RLS) para impedir que um usuário altere dados de outro; nunca colocar service role key no aplicativo.
- **RNF03 — Privacidade:** evitar coletar endereço residencial desnecessário; localização é a do problema, sujeita à revisão pelo usuário; cuidado com pessoas, placas e dados pessoais nas fotos.
- **RNF04 — Usabilidade:** interface em português, estados vazios, mensagens de erro claras, feedback de carregamento e controles acessíveis.
- **RNF05 — Resiliência:** tratar rede indisponível, permissões recusadas, falhas de upload e dados inválidos sem travar o app.
- **RNF06 — Qualidade:** regras centrais cobertas por testes unitários e de integração; documentar ciclos TDD Red–Green–Refactor.
- **RNF07 — Rastreabilidade:** mudanças vinculadas a cartões Trello, commits GitHub e evidências reproduzíveis.
- **RNF08 — Transparência:** exibir aviso de que o projeto não é serviço oficial da prefeitura; status não equivale a atendimento oficial.

## 5. Regras de negócio

- **RN01:** visitante não autenticado pode consultar ocorrências publicadas, mas não criar, editar ou excluir.
- **RN02:** cadastro de ocorrência exige sessão válida e os campos obrigatórios preenchidos.
- **RN03:** cada ocorrência pertence ao usuário criador (identificado pelo ID do Supabase Auth).
- **RN04:** apenas o proprietário pode editar ou excluir sua ocorrência; a restrição deve ser aplicada também no banco via RLS.
- **RN05:** a seleção de foto e as permissões de câmera/galeria são opcionais; recusa de permissão não bloqueia consulta nem cadastro sem foto, se admitido pelo formulário.
- **RN06:** se o usuário recusar geolocalização, poderá informar bairro e selecionar posição manualmente no mapa antes de publicar.
- **RN07:** status inicial é 'Aberta'; alterações dependem de política definida e devem ser apresentadas como acompanhamento comunitário, não oficial.
- **RN08:** notificações dependem de consentimento e disponibilidade do dispositivo; push remoto não é requisito obrigatório do MVP.
- **RN09:** registros de demonstração não devem conter dados pessoais reais sem necessidade e autorização.
- **RN10:** acesso público limita-se aos campos aprovados para exposição; e-mail e identificadores de autenticação não são exibidos.

## 6. Escopo e limites

**Incluído no MVP:** autenticação mista, cadastro/consulta/edição/exclusão autorizada, fotos, mapa/localização, filtros, status comunitário, notificações locais, testes e validação.

**Fora do escopo:** integração com prefeitura, encaminhamento oficial, garantia de resolução, chat, avaliações públicas de moradores, pagamentos, moderação avançada, painel administrativo complexo e push remoto em produção.

**Pontos pendentes:** definir quem pode alterar o status das ocorrências, como será feita a publicação e por quanto tempo as fotos serão guardadas. Também vou conferir os limites dos serviços e considerar as respostas da pesquisa.

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

Estou usando o Trello para acompanhar as tarefas e o GitHub para guardar o código e a documentação. Este arquivo reúne o escopo e os requisitos do PB02. Depois da pesquisa com moradores (PB01), vou revisar o que for necessário. O relatório seguirá o modelo fornecido pelo professor.

## 11. Pendências

- Consolidar resultados reais da pesquisa: https://forms.cloud.microsoft/r/E0ed0xag4N
- Confirmar com o professor autorização excepcional para entrega individual, pois o enunciado exige grupo.
- Definir as regras de atualização de status e publicação das ocorrências.
