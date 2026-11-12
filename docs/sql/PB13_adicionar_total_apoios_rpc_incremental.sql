-- PROPOSTA INCREMENTAL PARA REVISÃO. NÃO EXECUTAR sem validar primeiro em teste.
-- A RPC existente possui oito colunas de saída. PostgreSQL não permite mudar
-- sua tabela de retorno com CREATE OR REPLACE; esta transação remove e recria
-- somente a função sem argumentos. Não usa CASCADE e não altera políticas RLS.
-- Requer sessão administrativa postgres. Qualquer falha reverte a transação.
-- Pré-requisito: a função existente já usa os dois formatos de claim JWT e a
-- policy ocorrencias_pb13_rpc_select_own aplica a mesma identidade sem auth.uid().

begin;

-- Pré-condições e auditoria de dependências. Qualquer objeto dependente bloqueia
-- a migração; não trocar RESTRICT por CASCADE. A função é removida somente se
-- a definição instalada corresponder ao contrato esperado.
do $$
declare
  id_funcao oid;
  id_role_dona oid;
  id_role_postgres oid;
  id_role_authenticated oid;
  definicao text;
  dependencias text;
  tipo_total oid;
  rls_ativada boolean;
begin
  if current_user <> 'postgres' then
    raise exception 'Execute esta proposta como postgres; nenhuma alteração foi aplicada';
  end if;

  select oid into id_role_dona
  from pg_catalog.pg_roles
  where rolname = 'bairroativo_pb13_rpc_owner'
    and not rolcanlogin
    and not rolinherit
    and not rolbypassrls;

  select oid into id_role_postgres from pg_catalog.pg_roles where rolname = 'postgres';
  select oid into id_role_authenticated from pg_catalog.pg_roles where rolname = 'authenticated';

  if id_role_dona is null or id_role_postgres is null or id_role_authenticated is null then
    raise exception 'Role proprietária restrita, postgres ou authenticated ausente/insegura';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_auth_members as membro
    where (membro.roleid = id_role_dona or membro.member = id_role_dona)
      and not (membro.roleid = id_role_dona and membro.member = id_role_postgres)
  ) then
    raise exception 'A role proprietária tem associação inesperada; revise antes da migração';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_auth_members as membro
    where membro.roleid = id_role_dona
      and membro.member = id_role_postgres
      and membro.admin_option
      and not membro.inherit_option
      and not membro.set_option
  ) then
    raise exception 'O vínculo administrativo original entre a role proprietária e postgres mudou';
  end if;

  if pg_catalog.has_schema_privilege(id_role_dona, 'howviii', 'CREATE') then
    raise exception 'A role proprietária já tem CREATE em howviii; não é seguro revogá-lo automaticamente';
  end if;
  if not pg_catalog.has_schema_privilege(id_role_dona, 'howviii', 'USAGE') then
    raise exception 'A role proprietária não tem USAGE em howviii';
  end if;

  select p.oid into id_funcao
  from pg_catalog.pg_proc as p
  join pg_catalog.pg_namespace as n on n.oid = p.pronamespace
  where n.nspname = 'howviii'
    and p.proname = 'listar_minhas_ocorrencias'
    and p.pronargs = 0;

  if id_funcao is null then
    raise exception 'A RPC instalada howviii.listar_minhas_ocorrencias() não foi encontrada';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_depend as d
    where d.refclassid = 'pg_catalog.pg_proc'::regclass
      and d.refobjid = id_funcao
  ) then
    select string_agg(
      pg_catalog.pg_describe_object(d.classid, d.objid, d.objsubid),
      E'\n'
    ) into dependencias
    from pg_catalog.pg_depend as d
    where d.refclassid = 'pg_catalog.pg_proc'::regclass
      and d.refobjid = id_funcao;

    raise exception 'A RPC tem dependências registradas. Nenhuma alteração foi aplicada.'
      using detail = dependencias;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_proc as p
    where p.oid = id_funcao
      and p.proowner = id_role_dona
      and p.prosecdef
      and p.proretset
      and p.prorettype = 'record'::regtype
      and p.pronargs = 0
      and array_to_string(p.proargnames, ',') =
        'id,titulo,descricao,categoria,bairro,status,criado_em,nome_publico'
      and array_to_string(p.proargmodes, '') = 'tttttttt'
      and p.proallargtypes = ARRAY[
        'uuid'::regtype::oid,
        'text'::regtype::oid,
        'text'::regtype::oid,
        'text'::regtype::oid,
        'text'::regtype::oid,
        'text'::regtype::oid,
        'timestamptz'::regtype::oid,
        'text'::regtype::oid
      ]::oid[]
      and p.proconfig @> ARRAY['search_path=""']
  ) then
    raise exception 'A definição instalada não corresponde à RPC de oito colunas, SECURITY DEFINER e search_path vazio';
  end if;

  definicao := pg_catalog.pg_get_functiondef(id_funcao);
  if position('request.jwt.claim.sub' in definicao) = 0
     or position('request.jwt.claims' in definicao) = 0
     or position('auth.uid' in lower(definicao)) > 0 then
    raise exception 'A RPC instalada não contém os dois formatos JWT esperados ou contém auth.uid(); nenhuma alteração foi aplicada';
  end if;

  if pg_catalog.has_function_privilege('anon', id_funcao, 'EXECUTE')
     or not pg_catalog.has_function_privilege('authenticated', id_funcao, 'EXECUTE') then
    raise exception 'Privilégios da RPC inesperados: EXECUTE deve ser permitido a authenticated e negado a anon';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_proc as p,
         lateral pg_catalog.aclexplode(
           coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))
         ) as acl
    where p.oid = id_funcao
      and acl.grantee not in (id_role_dona, id_role_authenticated)
  ) then
    raise exception 'A ACL contém destinatários além da role proprietária e authenticated; revise antes de recriar a função';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_policies as pol
    where pol.schemaname = 'howviii'
      and pol.tablename = 'ocorrencias'
      and pol.policyname = 'ocorrencias_pb13_rpc_select_own'
      and pol.cmd = 'SELECT'
      and 'bairroativo_pb13_rpc_owner' = any(pol.roles)
      and position('request.jwt.claim.sub' in pol.qual) > 0
      and position('request.jwt.claims' in pol.qual) > 0
      and position('auth.uid' in lower(pol.qual)) = 0
  ) then
    raise exception 'A policy RLS existente não corresponde aos dois formatos JWT; ela não será substituída por esta migração';
  end if;

  select c.relrowsecurity into rls_ativada
  from pg_catalog.pg_class as c
  where c.oid = 'howviii.ocorrencias'::regclass;
  if rls_ativada is distinct from true then
    raise exception 'RLS precisa permanecer ativa em howviii.ocorrencias';
  end if;

  if exists (
    select 1
    from (values ('id'), ('autor_id'), ('titulo'), ('descricao'), ('categoria'),
                 ('bairro'), ('status'), ('criado_em'), ('nome_publico')) as c(coluna)
    where not pg_catalog.has_column_privilege(
      id_role_dona,
      'howviii.ocorrencias'::regclass,
      c.coluna,
      'SELECT'
    )
  ) then
    raise exception 'A role proprietária não tem SELECT nas colunas atuais usadas pela RPC';
  end if;

  select a.atttypid into tipo_total
  from pg_catalog.pg_attribute as a
  where a.attrelid = 'howviii.ocorrencias'::regclass
    and a.attname = 'total_apoios'
    and a.attnum > 0
    and not a.attisdropped;

  if tipo_total is distinct from 'integer'::regtype::oid then
    raise exception 'A coluna howviii.ocorrencias.total_apoios não existe ou não é integer';
  end if;
end;
$$;

-- Libera à role restrita somente a nova coluna que a RPC passará a ler.
do $$
begin
  if not pg_catalog.has_column_privilege(
    'bairroativo_pb13_rpc_owner',
    'howviii.ocorrencias'::regclass,
    'total_apoios',
    'SELECT'
  ) then
    grant select (total_apoios)
      on table howviii.ocorrencias
      to bairroativo_pb13_rpc_owner;
  end if;
end;
$$;

-- Concede CREATE apenas durante a substituição. SET SESSION AUTHORIZATION como
-- superuser define o proprietário sem alterar a associação persistente da role.
grant create on schema howviii to bairroativo_pb13_rpc_owner;
set session authorization bairroativo_pb13_rpc_owner;

drop function howviii.listar_minhas_ocorrencias() restrict;

create function howviii.listar_minhas_ocorrencias()
returns table (
  id uuid,
  titulo text,
  descricao text,
  categoria text,
  bairro text,
  status text,
  criado_em timestamptz,
  nome_publico text,
  total_apoios integer
)
language sql
stable
security definer
set search_path = ''
as $$
  with identidade as (
    select
      nullif(pg_catalog.current_setting('request.jwt.claim.sub', true), '') as claim_sub,
      nullif(pg_catalog.current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub' as claims_sub
  )
  select o.id, o.titulo, o.descricao, o.categoria, o.bairro,
         o.status, o.criado_em, o.nome_publico, o.total_apoios
  from howviii.ocorrencias as o
  where o.autor_id = (
    select coalesce(
      case
        when claim_sub ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          then claim_sub::uuid
      end,
      case
        when claims_sub ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          then claims_sub::uuid
      end
    )
    from identidade
  )
  order by o.criado_em desc;
$$;

-- Reaplica o contrato de EXECUTE: authenticated pode chamar, anon e PUBLIC não.
revoke all on function howviii.listar_minhas_ocorrencias() from public, anon, authenticated;
grant execute on function howviii.listar_minhas_ocorrencias() to authenticated;

reset session authorization;
revoke create on schema howviii from bairroativo_pb13_rpc_owner;

-- Confirma owner, SECURITY DEFINER, formato de retorno, leitura JWT, RLS intacta
-- e privilégios após recriar a função.
do $$
declare
  id_funcao oid;
  id_role_dona oid;
  id_role_authenticated oid;
  definicao text;
begin
  select oid into id_role_dona
  from pg_catalog.pg_roles
  where rolname = 'bairroativo_pb13_rpc_owner';
  select oid into id_role_authenticated
  from pg_catalog.pg_roles
  where rolname = 'authenticated';

  select p.oid into id_funcao
  from pg_catalog.pg_proc as p
  join pg_catalog.pg_namespace as n on n.oid = p.pronamespace
  where n.nspname = 'howviii'
    and p.proname = 'listar_minhas_ocorrencias'
    and p.pronargs = 0
    and p.proowner = id_role_dona
    and p.prosecdef
    and array_to_string(p.proargnames, ',') =
      'id,titulo,descricao,categoria,bairro,status,criado_em,nome_publico,total_apoios'
    and array_to_string(p.proargmodes, '') = 'ttttttttt'
    and p.proallargtypes = ARRAY[
      'uuid'::regtype::oid,
      'text'::regtype::oid,
      'text'::regtype::oid,
      'text'::regtype::oid,
      'text'::regtype::oid,
      'text'::regtype::oid,
      'timestamptz'::regtype::oid,
      'text'::regtype::oid,
      'integer'::regtype::oid
    ]::oid[]
    and p.proconfig @> ARRAY['search_path=""'];

  if id_funcao is null then
    raise exception 'Pós-condição falhou: owner, SECURITY DEFINER ou retorno de nove colunas incorreto';
  end if;

  definicao := pg_catalog.pg_get_functiondef(id_funcao);
  if position('request.jwt.claim.sub' in definicao) = 0
     or position('request.jwt.claims' in definicao) = 0
     or position('auth.uid' in lower(definicao)) > 0 then
    raise exception 'Pós-condição falhou: leitura dos claims JWT foi alterada';
  end if;

  if pg_catalog.has_function_privilege('anon', id_funcao, 'EXECUTE')
     or not pg_catalog.has_function_privilege('authenticated', id_funcao, 'EXECUTE') then
    raise exception 'Pós-condição falhou: EXECUTE deve ser exclusivo de authenticated';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_proc as p,
         lateral pg_catalog.aclexplode(
           coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))
         ) as acl
    where p.oid = id_funcao
      and acl.grantee not in (id_role_dona, id_role_authenticated)
  ) then
    raise exception 'Pós-condição falhou: ACL concede acesso a PUBLIC, anon ou outro papel';
  end if;

  if pg_catalog.has_schema_privilege(id_role_dona, 'howviii', 'CREATE') then
    raise exception 'Pós-condição falhou: privilégio CREATE temporário não foi removido';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_policies as pol
    where pol.schemaname = 'howviii'
      and pol.tablename = 'ocorrencias'
      and pol.policyname = 'ocorrencias_pb13_rpc_select_own'
      and pol.cmd = 'SELECT'
      and 'bairroativo_pb13_rpc_owner' = any(pol.roles)
  ) then
    raise exception 'Pós-condição falhou: policy RLS original não está presente';
  end if;
end;
$$;

commit;
