-- SCRIPT DE INSTALAÇÃO INICIAL, mantido como referência histórica.
-- Não executar sobre uma instalação que já tenha listar_minhas_ocorrencias().
-- Para adicionar total_apoios à RPC existente, revise a migração incremental
-- PB13_adicionar_total_apoios_rpc_incremental.sql.
-- NÃO EXECUTAR sem revisão e validação com dois usuários.
-- Executar como role administrativa com permissão para criar roles/policies.
-- Tudo é transacional: uma falha reverte todos os ajustes.
-- Após revisão, validar os cenários em docs/sql/PB13_verificacoes_identidade.sql.
begin;

-- Remove permissões UPDATE em tabela e coluna; reabre apenas os campos PB13.
revoke update on table howviii.ocorrencias from authenticated;
do $$
declare
  permissao record;
begin
  for permissao in
    select column_name
    from information_schema.column_privileges
    where table_schema = 'howviii'
      and table_name = 'ocorrencias'
      and grantee = 'authenticated'
      and privilege_type = 'UPDATE'
  loop
    execute format(
      'revoke update (%I) on table howviii.ocorrencias from authenticated',
      permissao.column_name
    );
  end loop;
end;
$$;
grant update (titulo, descricao, categoria, bairro, nome_publico)
  on table howviii.ocorrencias to authenticated;

-- Role proprietária da função sem LOGIN, herança ou BYPASSRLS. Ela não deve
-- ser membro de outras roles nem ter membros, para usuários não poderem SET ROLE.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'bairroativo_pb13_rpc_owner') then
    execute 'create role bairroativo_pb13_rpc_owner nologin noinherit nobypassrls';
  end if;
end;
$$;
alter role bairroativo_pb13_rpc_owner nologin noinherit nobypassrls;

do $$
declare
  id_role oid := (select oid from pg_roles where rolname = 'bairroativo_pb13_rpc_owner');
begin
  if exists (
    select 1 from pg_auth_members
    where roleid = id_role or member = id_role
  ) then
    raise exception 'A role bairroativo_pb13_rpc_owner não pode ter membros ou participar de outras roles';
  end if;
end;
$$;

grant usage, create on schema howviii to bairroativo_pb13_rpc_owner;
grant usage on schema auth to bairroativo_pb13_rpc_owner;
grant execute on function auth.uid() to bairroativo_pb13_rpc_owner;

-- Privilegia apenas colunas de resposta e autor_id; nenhuma escrita.
revoke all on table howviii.ocorrencias from bairroativo_pb13_rpc_owner;
grant select (id, autor_id, titulo, descricao, categoria, bairro, status, criado_em, nome_publico)
  on table howviii.ocorrencias to bairroativo_pb13_rpc_owner;

-- Defesa em profundidade: mesmo a role da função só lê linhas do JWT atual.
-- A expressão usa auth.uid() e trata explicitamente os dois formatos de claims
-- usados pelo PostgREST, tanto na política quanto na função RPC.
drop policy if exists ocorrencias_pb13_rpc_select_own on howviii.ocorrencias;
create policy ocorrencias_pb13_rpc_select_own
  on howviii.ocorrencias
  for select
  to bairroativo_pb13_rpc_owner
  using (
    autor_id = (
      select coalesce(
        auth.uid(),
        nullif(current_setting('request.jwt.claim.sub', true), '')::uuid,
        nullif(
          nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub',
          ''
        )::uuid
      )
    )
  );

create or replace function howviii.listar_minhas_ocorrencias()
returns table (
  id uuid,
  titulo text,
  descricao text,
  categoria text,
  bairro text,
  status text,
  criado_em timestamptz,
  nome_publico text
)
language sql
stable
security definer
set search_path = ''
as $$
  select o.id, o.titulo, o.descricao, o.categoria, o.bairro,
         o.status, o.criado_em, o.nome_publico
  from howviii.ocorrencias as o
  where o.autor_id = (
    select coalesce(
      auth.uid(),
      nullif(current_setting('request.jwt.claim.sub', true), '')::uuid,
      nullif(
        nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub',
        ''
      )::uuid
    )
  )
  order by o.criado_em desc;
$$;

alter function howviii.listar_minhas_ocorrencias() owner to bairroativo_pb13_rpc_owner;
revoke create on schema howviii from bairroativo_pb13_rpc_owner;
revoke all on function howviii.listar_minhas_ocorrencias() from public, anon, authenticated;
grant execute on function howviii.listar_minhas_ocorrencias() to authenticated;

commit;
