-- PROPOSTA INCREMENTAL PARA REVISÃO E EXECUÇÃO MANUAL NO SQL EDITOR.
-- Atualiza somente howviii.listar_minhas_ocorrencias() e a policy
-- howviii.ocorrencias_pb13_rpc_select_own. Não altera linhas de ocorrências.
-- Todo o script é transacional: qualquer erro antes do COMMIT exige ROLLBACK.
-- Executar conectado como postgres. Não executar por meio do aplicativo.

begin;

-- Pré-condições e salvaguardas. A única associação de role aceita é o vínculo
-- administrativo original role_owner -> postgres, sem herança nem SET inicial.
do $$
declare
  role_owner oid;
  role_postgres oid;
  dono_funcao oid;
  funcao_security_definer boolean;
begin
  if current_user <> 'postgres' then
    raise exception 'Execute esta proposta como postgres; nenhuma alteração foi aplicada';
  end if;

  select oid into role_owner
  from pg_catalog.pg_roles
  where rolname = 'bairroativo_pb13_rpc_owner'
    and rolcanlogin = false
    and rolinherit = false
    and rolbypassrls = false;

  select oid into role_postgres
  from pg_catalog.pg_roles
  where rolname = 'postgres';

  if role_owner is null or role_postgres is null then
    raise exception 'Role proprietária restrita ou postgres ausente/insegura';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_auth_members as m
    where (m.roleid = role_owner or m.member = role_owner)
      and not (m.roleid = role_owner and m.member = role_postgres)
  ) then
    raise exception 'A role proprietária tem vínculo adicional não autorizado';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_auth_members as m
    where m.roleid = role_owner and m.member = role_postgres
      and m.admin_option
      and not m.inherit_option
      and not m.set_option
  ) then
    raise exception 'Vínculo administrativo original com postgres não está no estado esperado';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_auth_members as m
    where m.roleid = role_owner and m.member = role_postgres
      and (not m.admin_option or m.inherit_option or m.set_option)
  ) then
    raise exception 'O vínculo com postgres tem opções inesperadas; nenhuma alteração foi aplicada';
  end if;

  if pg_catalog.has_schema_privilege(role_owner, 'howviii', 'CREATE') then
    raise exception 'A role proprietária já tem CREATE em howviii; revise antes de aplicar para não remover privilégio preexistente';
  end if;
  if not pg_catalog.has_schema_privilege(role_owner, 'howviii', 'USAGE') then
    raise exception 'A role proprietária não tem USAGE em howviii; revise os grants existentes antes de aplicar';
  end if;

  select p.proowner, p.prosecdef
    into dono_funcao, funcao_security_definer
  from pg_catalog.pg_proc as p
  join pg_catalog.pg_namespace as n on n.oid = p.pronamespace
  where n.nspname = 'howviii'
    and p.proname = 'listar_minhas_ocorrencias'
    and p.pronargs = 0;

  if dono_funcao is null then
    raise exception 'A função howviii.listar_minhas_ocorrencias() não existe';
  end if;
  if dono_funcao <> role_owner then
    raise exception 'A função não pertence a bairroativo_pb13_rpc_owner';
  end if;
  if not funcao_security_definer then
    raise exception 'A função existente não é SECURITY DEFINER';
  end if;

  if pg_catalog.has_function_privilege('anon', 'howviii.listar_minhas_ocorrencias()', 'EXECUTE') then
    raise exception 'anon possui EXECUTE na RPC; revise os grants antes de aplicar';
  end if;
  if not pg_catalog.has_function_privilege('authenticated', 'howviii.listar_minhas_ocorrencias()', 'EXECUTE') then
    raise exception 'authenticated não possui EXECUTE na RPC; revise os grants antes de aplicar';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_policies
    where schemaname = 'howviii'
      and tablename = 'ocorrencias'
      and policyname = 'ocorrencias_pb13_rpc_select_own'
      and cmd = 'SELECT'
      and 'bairroativo_pb13_rpc_owner' = any(roles)
  ) then
    raise exception 'A policy ocorrencias_pb13_rpc_select_own não existe para a role proprietária';
  end if;
end;
$$;

-- Habilita somente SET ROLE temporariamente. INHERIT permanece FALSE e ADMIN
-- é omitido para preservar a opção administrativa original. Ambos os REVOKEs
-- abaixo revertem apenas o privilégio adicionado pelo script.
grant bairroativo_pb13_rpc_owner to postgres with inherit false, set true;
grant create on schema howviii to bairroativo_pb13_rpc_owner;
set local role bairroativo_pb13_rpc_owner;

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
  with identidade as (
    select
      nullif(pg_catalog.current_setting('request.jwt.claim.sub', true), '') as claim_sub,
      nullif(pg_catalog.current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub' as claims_sub
  )
  select o.id, o.titulo, o.descricao, o.categoria, o.bairro,
         o.status, o.criado_em, o.nome_publico
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

reset role;

-- Policy DDL é aplicada novamente por postgres, proprietário administrativo da
-- tabela. O predicado usa exatamente a mesma extração de identidade da RPC.
drop policy ocorrencias_pb13_rpc_select_own on howviii.ocorrencias;
create policy ocorrencias_pb13_rpc_select_own
  on howviii.ocorrencias
  for select
  to bairroativo_pb13_rpc_owner
  using (
    autor_id = (
      select coalesce(
        case
          when nullif(pg_catalog.current_setting('request.jwt.claim.sub', true), '')
            ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          then nullif(pg_catalog.current_setting('request.jwt.claim.sub', true), '')::uuid
        end,
        case
          when (nullif(pg_catalog.current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
            ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          then (nullif(pg_catalog.current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid
        end
      )
    )
  );

-- Retira o único privilégio de schema adicionado pelo script antes de validar.
revoke create on schema howviii from bairroativo_pb13_rpc_owner;
revoke bairroativo_pb13_rpc_owner from postgres granted by postgres;

-- Pós-condições: proprietário, SECURITY DEFINER, EXECUTE, role da policy e
-- ausência do CREATE temporário permanecem conforme esperado.
do $$
declare
  role_owner oid;
  dono_funcao oid;
  funcao_security_definer boolean;
begin
  select oid into role_owner
  from pg_catalog.pg_roles
  where rolname = 'bairroativo_pb13_rpc_owner';

  select p.proowner, p.prosecdef
    into dono_funcao, funcao_security_definer
  from pg_catalog.pg_proc as p
  join pg_catalog.pg_namespace as n on n.oid = p.pronamespace
  where n.nspname = 'howviii'
    and p.proname = 'listar_minhas_ocorrencias'
    and p.pronargs = 0;

  if dono_funcao <> role_owner or not funcao_security_definer then
    raise exception 'A função perdeu proprietário restrito ou SECURITY DEFINER';
  end if;
  if pg_catalog.has_function_privilege('anon', 'howviii.listar_minhas_ocorrencias()', 'EXECUTE')
     or not pg_catalog.has_function_privilege('authenticated', 'howviii.listar_minhas_ocorrencias()', 'EXECUTE') then
    raise exception 'Os privilégios EXECUTE da RPC foram alterados inesperadamente';
  end if;
  if pg_catalog.has_schema_privilege(role_owner, 'howviii', 'CREATE') then
    raise exception 'O privilégio temporário CREATE em howviii não foi revogado';
  end if;
  if exists (
    select 1
    from pg_catalog.pg_auth_members as m
    join pg_catalog.pg_roles as r on r.oid = m.member
    where m.roleid = role_owner
      and r.rolname = 'postgres'
      and (not m.admin_option or m.inherit_option or m.set_option)
  ) or not exists (
    select 1
    from pg_catalog.pg_auth_members as m
    join pg_catalog.pg_roles as r on r.oid = m.member
    where m.roleid = role_owner
      and r.rolname = 'postgres'
      and m.admin_option
      and not m.inherit_option
      and not m.set_option
  ) then
    raise exception 'O vínculo administrativo original com postgres não foi preservado';
  end if;
  if not exists (
    select 1
    from pg_catalog.pg_policies
    where schemaname = 'howviii'
      and tablename = 'ocorrencias'
      and policyname = 'ocorrencias_pb13_rpc_select_own'
      and cmd = 'SELECT'
      and 'bairroativo_pb13_rpc_owner' = any(roles)
  ) then
    raise exception 'A policy PB13 não ficou instalada para a role proprietária';
  end if;
end;
$$;

commit;
