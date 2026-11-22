-- Catálogo de cidades e bairros. Brusque é a cidade inicial ativa.
-- Florianópolis fica inativa apenas para preservar os relatos cadastrados no catálogo anterior.
create table howviii.cidades (
  codigo_ibge integer primary key,
  nome text not null,
  uf char(2) not null,
  ativa boolean not null default true,
  criado_em timestamptz not null default now(),
  constraint cidades_codigo_ibge_valido check (codigo_ibge > 0),
  constraint cidades_nome_uf_unicos unique (nome, uf)
);

create table howviii.bairros (
  cidade_ibge integer not null references howviii.cidades(codigo_ibge) on delete restrict,
  nome text not null,
  criado_em timestamptz not null default now(),
  constraint bairros_pk primary key (cidade_ibge, nome),
  constraint bairros_nome_valido check (length(btrim(nome)) between 2 and 120)
);

insert into howviii.cidades (codigo_ibge, nome, uf, ativa) values
  (4202909, 'Brusque', 'SC', true),
  (4205407, 'Florianópolis', 'SC', false);

insert into howviii.bairros (cidade_ibge, nome) values
  (4202909, 'Águas Claras'),
  (4202909, 'Azambuja'),
  (4202909, 'Bateas'),
  (4202909, 'Cedrinho'),
  (4202909, 'Centro I'),
  (4202909, 'Centro II'),
  (4202909, 'Cerâmica Reis'),
  (4202909, 'Dom Joaquim'),
  (4202909, 'Guarani'),
  (4202909, 'Jardim Maluche'),
  (4202909, 'Limeira Alta'),
  (4202909, 'Limeira Baixa'),
  (4202909, 'Limoeiro'),
  (4202909, 'Nova Brasília'),
  (4202909, 'Paquetá'),
  (4202909, 'Planalto'),
  (4202909, 'Poço Fundo'),
  (4202909, 'Ponta Russa'),
  (4202909, 'Primeiro de Maio'),
  (4202909, 'Rio Branco'),
  (4202909, 'Santa Luzia'),
  (4202909, 'Santa Rita'),
  (4202909, 'Santa Terezinha'),
  (4202909, 'São João'),
  (4202909, 'São Luiz'),
  (4202909, 'São Pedro'),
  (4202909, 'Souza Cruz'),
  (4202909, 'Steffen'),
  (4202909, 'Tomaz Coelho'),
  (4202909, 'Volta Grande'),
  (4202909, 'Zantão'),
  (4205407, 'Centro'),
  (4205407, 'Trindade'),
  (4205407, 'Itacorubi'),
  (4205407, 'Córrego Grande'),
  (4205407, 'Saco dos Limões'),
  (4205407, 'Santa Mônica'),
  (4205407, 'Outros');

alter table howviii.perfis
  add column cidade_ibge integer references howviii.cidades(codigo_ibge) on delete restrict;

alter table howviii.ocorrencias
  add column cidade_ibge integer references howviii.cidades(codigo_ibge) on delete restrict;

-- Os relatos existentes usavam exclusivamente o catálogo antigo de bairros de Florianópolis.
update howviii.ocorrencias set cidade_ibge = 4205407 where cidade_ibge is null;

alter table howviii.ocorrencias
  alter column cidade_ibge set not null;

create index ocorrencias_cidade_criado_em_idx
  on howviii.ocorrencias (cidade_ibge, criado_em desc);

create or replace function howviii.validar_cidade_ativa_perfil()
returns trigger
language plpgsql
set search_path = howviii, pg_temp
as $$
begin
  if new.cidade_ibge is not null and not exists (
    select 1 from howviii.cidades c
    where c.codigo_ibge = new.cidade_ibge and c.ativa
  ) then
    raise exception 'Selecione uma cidade disponível.';
  end if;
  return new;
end;
$$;

create trigger perfis_validar_cidade_ativa
before insert or update of cidade_ibge on howviii.perfis
for each row execute function howviii.validar_cidade_ativa_perfil();

create table howviii.sugestoes_bairros (
  id uuid primary key default gen_random_uuid(),
  cidade_ibge integer not null references howviii.cidades(codigo_ibge) on delete restrict,
  usuario_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  status text not null default 'pendente',
  criado_em timestamptz not null default now(),
  constraint sugestoes_bairros_nome_valido check (length(btrim(nome)) between 2 and 120),
  constraint sugestoes_bairros_status_valido check (status in ('pendente', 'aprovada', 'rejeitada'))
);

alter table howviii.cidades enable row level security;
alter table howviii.bairros enable row level security;
alter table howviii.sugestoes_bairros enable row level security;

create policy "cidades_ativas_leitura_publica"
on howviii.cidades for select to anon, authenticated
using (ativa);

create policy "bairros_de_cidades_ativas_leitura_publica"
on howviii.bairros for select to anon, authenticated
using (exists (
  select 1 from howviii.cidades c
  where c.codigo_ibge = bairros.cidade_ibge and c.ativa
));

create policy "sugestoes_bairros_ler_proprias"
on howviii.sugestoes_bairros for select to authenticated
using (usuario_id = (select auth.uid()));

create policy "sugestoes_bairros_criar_proprias"
on howviii.sugestoes_bairros for insert to authenticated
with check (
  usuario_id = (select auth.uid())
  and status = 'pendente'
  and exists (
    select 1 from howviii.perfis p
    where p.id = (select auth.uid()) and p.cidade_ibge = sugestoes_bairros.cidade_ibge
  )
);

-- Uma nova ocorrência só pode ser criada na cidade vinculada ao perfil autenticado.
drop policy if exists "ocorrencias_criar" on howviii.ocorrencias;
create policy "ocorrencias_criar"
on howviii.ocorrencias for insert to authenticated
with check (
  autor_id = (select auth.uid())
  and total_apoios = 0
  and cidade_ibge = (
    select p.cidade_ibge from howviii.perfis p where p.id = (select auth.uid())
  )
  and latitude is not null and latitude between -90 and 90
  and longitude is not null and longitude between -180 and 180
);

-- A cidade de um relato não pode ser trocada depois da criação.
create or replace function howviii.impedir_troca_cidade_ocorrencia()
returns trigger
language plpgsql
set search_path = howviii, pg_temp
as $$
begin
  if new.cidade_ibge is distinct from old.cidade_ibge then
    raise exception 'A cidade de uma ocorrência não pode ser alterada.';
  end if;
  return new;
end;
$$;

create trigger ocorrencias_impedir_troca_cidade
before update of cidade_ibge on howviii.ocorrencias
for each row execute function howviii.impedir_troca_cidade_ocorrencia();

grant usage on schema howviii to anon, authenticated;
grant select on howviii.cidades, howviii.bairros to anon, authenticated;
grant select, insert on howviii.sugestoes_bairros to authenticated;
grant select, insert, update on howviii.perfis to authenticated;
grant select, insert, update, delete on howviii.ocorrencias to authenticated;
