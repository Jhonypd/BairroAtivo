-- VERIFICAÇÃO MANUAL — NÃO É MIGRAÇÃO. NÃO EXECUTAR nesta revisão.
-- Executar em ambiente de teste depois da correção JWT previamente instalada e
-- de PB13_adicionar_total_apoios_rpc_incremental.sql, se aprovada/aplicada.
-- Requer sessão administrativa (postgres) e duas contas distintas, cada uma
-- com pelo menos uma ocorrência. A transação termina em ROLLBACK.

begin;

-- Registra os dados de teste em GUCs temporárias antes de assumir roles do app.
select
  set_config('pb13.test.ocorrencia_id', teste.id::text, true),
  set_config('pb13.test.autor_id', teste.autor_id::text, true),
  set_config('pb13.test.outra_ocorrencia_id', teste.outra_id::text, true),
  set_config('pb13.test.outro_usuario_id', teste.outro_autor_id::text, true)
from (
  select propria.id, propria.autor_id,
         outra.id as outra_id, outra.autor_id as outro_autor_id
  from howviii.ocorrencias as propria
  join howviii.ocorrencias as outra
    on outra.autor_id <> propria.autor_id
  where propria.autor_id is not null
    and outra.autor_id is not null
  order by propria.criado_em desc, outra.criado_em desc
  limit 1
) as teste;

do $$
begin
  if current_setting('pb13.test.ocorrencia_id', true) is null
     or current_setting('pb13.test.autor_id', true) is null then
    raise exception 'Crie uma ocorrência de teste antes de executar as verificações PB13';
  end if;
  if current_setting('pb13.test.outra_ocorrencia_id', true) is null
     or current_setting('pb13.test.outro_usuario_id', true) is null then
    raise exception 'Crie ocorrências pertencentes a duas contas distintas para validar o isolamento';
  end if;
end;
$$;

set local role authenticated;

-- 1. Formato legado: identidade em request.jwt.claim.sub.
select set_config(
  'request.jwt.claim.sub',
  current_setting('pb13.test.autor_id', true),
  true
);
select set_config('request.jwt.claims', '', true);

do $$
declare
  total_apoios_esperado integer;
  total_apoios_retornado integer;
begin
  if not exists (
    select 1 from howviii.listar_minhas_ocorrencias() as o
    where o.id = current_setting('pb13.test.ocorrencia_id', true)::uuid
  ) then
    raise exception 'Falha: RPC não encontrou a ocorrência do autor com request.jwt.claim.sub';
  end if;

  select o.total_apoios into total_apoios_esperado
  from howviii.ocorrencias as o
  where o.id = current_setting('pb13.test.ocorrencia_id', true)::uuid;
  select o.total_apoios into total_apoios_retornado
  from howviii.listar_minhas_ocorrencias() as o
  where o.id = current_setting('pb13.test.ocorrencia_id', true)::uuid;
  if total_apoios_retornado is distinct from total_apoios_esperado then
    raise exception 'Falha: RPC retornou total_apoios %, esperado %',
      total_apoios_retornado, total_apoios_esperado;
  end if;
end;
$$;

-- 2. Formato JSON: identidade somente em request.jwt.claims.
select set_config('request.jwt.claim.sub', '', true);
select set_config(
  'request.jwt.claims',
  jsonb_build_object('sub', current_setting('pb13.test.autor_id', true))::text,
  true
);

do $$
declare
  total_apoios_esperado integer;
  total_apoios_retornado integer;
begin
  if not exists (
    select 1
    from howviii.listar_minhas_ocorrencias() as o
    where o.id = current_setting('pb13.test.ocorrencia_id', true)::uuid
  ) then
    raise exception 'Falha: RPC não encontrou a ocorrência do autor com request.jwt.claims';
  end if;

  select o.total_apoios into total_apoios_esperado
  from howviii.ocorrencias as o
  where o.id = current_setting('pb13.test.ocorrencia_id', true)::uuid;
  select o.total_apoios into total_apoios_retornado
  from howviii.listar_minhas_ocorrencias() as o
  where o.id = current_setting('pb13.test.ocorrencia_id', true)::uuid;
  if total_apoios_retornado is distinct from total_apoios_esperado then
    raise exception 'Falha: RPC retornou total_apoios % com claims JSON, esperado %',
      total_apoios_retornado, total_apoios_esperado;
  end if;
end;
$$;

-- 3. A segunda conta deve ver sua ocorrência e não pode ver a ocorrência alheia.
select set_config('request.jwt.claim.sub', '', true);
select set_config(
  'request.jwt.claims',
  jsonb_build_object('sub', current_setting('pb13.test.outro_usuario_id', true))::text,
  true
);

do $$
begin
  if exists (
    select 1 from howviii.listar_minhas_ocorrencias() as o
    where o.id = current_setting('pb13.test.ocorrencia_id', true)::uuid
  ) then
    raise exception 'Falha: outra conta recebeu a ocorrência pertencente ao primeiro autor';
  end if;
  if not exists (
    select 1 from howviii.listar_minhas_ocorrencias() as o
    where o.id = current_setting('pb13.test.outra_ocorrencia_id', true)::uuid
  ) then
    raise exception 'Falha: a RPC não retornou a ocorrência própria da segunda conta';
  end if;
end;
$$;

-- 4. Sem identidade JWT, a RPC executável por authenticated retorna zero linhas.
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '', true);

do $$
declare
  quantidade bigint;
begin
  select count(*) into quantidade from howviii.listar_minhas_ocorrencias();
  if quantidade <> 0 then
    raise exception 'Falha: chamada sem identidade retornou % ocorrências; esperado 0', quantidade;
  end if;
end;
$$;

-- 5. EXECUTE: anon deve estar bloqueado e authenticated deve estar autorizado.
do $$
declare
  id_funcao oid;
begin
  select 'howviii.listar_minhas_ocorrencias()'::regprocedure::oid into id_funcao;
  if has_function_privilege('anon', id_funcao, 'EXECUTE') then
    raise exception 'Falha: anon possui EXECUTE na RPC PB13';
  end if;
  if not has_function_privilege('authenticated', id_funcao, 'EXECUTE') then
    raise exception 'Falha: authenticated não possui EXECUTE na RPC PB13';
  end if;
  if exists (
    select 1
    from pg_catalog.pg_proc as p,
         lateral pg_catalog.aclexplode(
           coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))
         ) as acl
    where p.oid = id_funcao
      and acl.grantee = 0
      and acl.privilege_type = 'EXECUTE'
  ) then
    raise exception 'Falha: PUBLIC possui EXECUTE direto na RPC PB13';
  end if;
end;
$$;

-- 6. Testa a policy diretamente como a role restrita que executa a RPC.
-- Requer sessão postgres; SET SESSION AUTHORIZATION não altera associação de roles.
reset role;
set session authorization bairroativo_pb13_rpc_owner;
select set_config(
  'request.jwt.claim.sub',
  current_setting('pb13.test.autor_id', true),
  true
);
select set_config('request.jwt.claims', '', true);

do $$
begin
  if not exists (
    select 1
    from howviii.ocorrencias as o
    where o.id = current_setting('pb13.test.ocorrencia_id', true)::uuid
  ) then
    raise exception 'Falha: policy não expôs a ocorrência do autor via request.jwt.claim.sub';
  end if;
end;
$$;

-- O segundo formato também deve permitir a linha do autor.
select set_config('request.jwt.claim.sub', '', true);
select set_config(
  'request.jwt.claims',
  jsonb_build_object('sub', current_setting('pb13.test.autor_id', true))::text,
  true
);

do $$
begin
  if not exists (
    select 1
    from howviii.ocorrencias as o
    where o.id = current_setting('pb13.test.ocorrencia_id', true)::uuid
  ) then
    raise exception 'Falha: policy não expôs a ocorrência do autor via request.jwt.claims';
  end if;
end;
$$;

-- A policy não deve expor a primeira conta à segunda, mas deve permitir a linha própria.
select set_config(
  'request.jwt.claims',
  jsonb_build_object('sub', current_setting('pb13.test.outro_usuario_id', true))::text,
  true
);

do $$
begin
  if exists (
    select 1 from howviii.ocorrencias as o
    where o.id = current_setting('pb13.test.ocorrencia_id', true)::uuid
  ) then
    raise exception 'Falha: policy permitiu que a segunda conta consultasse ocorrência de terceiro';
  end if;
  if not exists (
    select 1 from howviii.ocorrencias as o
    where o.id = current_setting('pb13.test.outra_ocorrencia_id', true)::uuid
  ) then
    raise exception 'Falha: policy não retornou a ocorrência própria da segunda conta';
  end if;
end;
$$;

-- Confirma que a chamada anon falha por privilégio, mesmo sem claims.
reset role;
reset session authorization;

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '', true);

do $$
begin
  begin
    perform 1 from howviii.listar_minhas_ocorrencias();
    raise exception 'Falha: anon conseguiu executar a RPC PB13';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

rollback;
