-- PROPOSTA INCREMENTAL PARA REVISÃO MANUAL NO SQL EDITOR DO SUPABASE.
-- Atualiza somente howviii.listar_minhas_ocorrencias() e a policy
-- howviii.ocorrencias_pb13_rpc_select_own.
-- Não altera proprietário, grants, roles, tabelas ou outras policies.
-- Não executar antes da revisão. Aplicar como role administrativa.

begin;

-- Pré-condições: a função continua SECURITY DEFINER, pertence à role restrita,
-- e mantém os privilégios esperados. A role não pode ter membros nem herdar
-- privilégios de outras roles.
do $$
declare
  role_owner oid;
  dono_funcao oid;
  funcao_security_definer boolean;
begin
  select oid into role_owner
  from pg_roles
  where rolname = 'bairroativo_pb13_rpc_owner'
    and rolcanlogin = false
    and rolinherit = false
    and rolbypassrls = false;

  if role_owner is null then
    raise exception 'A role restrita bairroativo_pb13_rpc_owner não existe ou não tem atributos seguros';
  end if;

  if exists (
    select 1
    from pg_auth_members
    where roleid = role_owner or member = role_owner
  ) then
    raise exception 'A role bairroativo_pb13_rpc_owner não pode ter membros nem participar de outras roles';
  end if;

  select p.proowner, p.prosecdef
    into dono_funcao, funcao_security_definer
  from pg_proc as p
  join pg_namespace as n on n.oid = p.pronamespace
  where n.nspname = 'howviii'
    and p.proname = 'listar_minhas_ocorrencias'
    and p.pronargs = 0;

  if dono_funcao is null then
    raise exception 'A função howviii.listar_minhas_ocorrencias() não existe';
  end if;
  if dono_funcao <> role_owner then
    raise exception 'A função não pertence a bairroativo_pb13_rpc_owner; nenhuma alteração foi aplicada';
  end if;
  if not funcao_security_definer then
    raise exception 'A função deixou de ser SECURITY DEFINER; nenhuma alteração foi aplicada';
  end if;

  if has_function_privilege('anon', 'howviii.listar_minhas_ocorrencias()', 'EXECUTE') then
    raise exception 'anon possui EXECUTE na RPC; revise os grants antes de aplicar esta correção';
  end if;
  if not has_function_privilege('authenticated', 'howviii.listar_minhas_ocorrencias()', 'EXECUTE') then
    raise exception 'authenticated não possui EXECUTE na RPC; revise os grants antes de aplicar esta correção';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'howviii'
      and tablename = 'ocorrencias'
      and policyname = 'ocorrencias_pb13_rpc_select_own'
      and cmd = 'SELECT'
      and 'bairroativo_pb13_rpc_owner' = any(roles)
  ) then
    raise exception 'A policy ocorrencias_pb13_rpc_select_own não existe como policy SELECT da role proprietária';
  end if;
end;
$$;

-- CREATE OR REPLACE preserva owner e ACL da função existente.
-- A identidade aceita request.jwt.claim.sub e, como fallback, o JSON completo
-- request.jwt.claims. auth.uid() também permanece como primeira fonte nativa.
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

-- Atualiza somente a policy nomeada, mantendo role, comando e filtro por autor.
drop policy ocorrencias_pb13_rpc_select_own on howviii.ocorrencias;
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

-- Pós-condições: o owner e a barreira EXECUTE continuam iguais.
do $$
declare
  role_owner oid;
  dono_funcao oid;
  funcao_security_definer boolean;
begin
  select oid into role_owner
  from pg_roles
  where rolname = 'bairroativo_pb13_rpc_owner';

  select p.proowner, p.prosecdef
    into dono_funcao, funcao_security_definer
  from pg_proc as p
  join pg_namespace as n on n.oid = p.pronamespace
  where n.nspname = 'howviii'
    and p.proname = 'listar_minhas_ocorrencias'
    and p.pronargs = 0;

  if dono_funcao <> role_owner or not funcao_security_definer then
    raise exception 'A função perdeu seu proprietário restrito ou SECURITY DEFINER';
  end if;
  if has_function_privilege('anon', 'howviii.listar_minhas_ocorrencias()', 'EXECUTE')
     or not has_function_privilege('authenticated', 'howviii.listar_minhas_ocorrencias()', 'EXECUTE') then
    raise exception 'Os privilégios EXECUTE da função foram alterados inesperadamente';
  end if;
  if not exists (
    select 1
    from pg_policies
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
