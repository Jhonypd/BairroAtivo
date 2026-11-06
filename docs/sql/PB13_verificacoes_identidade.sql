-- VERIFICAÇÃO MANUAL — NÃO É MIGRAÇÃO.
-- Execute somente depois da migração base PB13 e de
-- PB13_corrigir_claims_minhas_ocorrencias_incremental.sql em ambiente de teste.
-- Requer sessão administrativa (postgres).
-- Pré-requisitos: uma ocorrência existente e uma segunda conta autenticada sem
-- ocorrências próprias. A transação termina em ROLLBACK e não altera dados.

begin;

-- Registra os dados de teste em GUCs temporárias antes de assumir roles do app.
select
  set_config('pb13.test.ocorrencia_id', teste.id::text, true),
  set_config('pb13.test.autor_id', teste.autor_id::text, true)
from (
  select id, autor_id
  from howviii.ocorrencias
  where autor_id is not null
  order by criado_em desc
  limit 1
) as teste;

select set_config(
  'pb13.test.outro_usuario_id',
  (
    select u.id::text
    from auth.users as u
    where u.id::text <> current_setting('pb13.test.autor_id', true)
      and not exists (
        select 1
        from howviii.ocorrencias as o
        where o.autor_id = u.id
      )
    limit 1
  ),
  true
);

do $$
begin
  if current_setting('pb13.test.ocorrencia_id', true) is null
     or current_setting('pb13.test.autor_id', true) is null then
    raise exception 'Crie uma ocorrência de teste antes de executar as verificações PB13';
  end if;
  if current_setting('pb13.test.outro_usuario_id', true) is null then
    raise exception 'Crie/seleciona uma segunda conta sem ocorrências próprias para o teste';
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
begin
  if not exists (
    select 1
    from howviii.listar_minhas_ocorrencias() as o
    where o.id = current_setting('pb13.test.ocorrencia_id', true)::uuid
  ) then
    raise exception 'Falha: RPC não encontrou a ocorrência do autor com request.jwt.claim.sub';
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
begin
  if not exists (
    select 1
    from howviii.listar_minhas_ocorrencias() as o
    where o.id = current_setting('pb13.test.ocorrencia_id', true)::uuid
  ) then
    raise exception 'Falha: RPC não encontrou a ocorrência do autor com request.jwt.claims';
  end if;
end;
$$;

-- 3. Outra identidade somente em request.jwt.claims deve receber zero linhas.
select set_config('request.jwt.claim.sub', '', true);
select set_config(
  'request.jwt.claims',
  jsonb_build_object('sub', current_setting('pb13.test.outro_usuario_id', true))::text,
  true
);

do $$
declare
  quantidade bigint;
begin
  select count(*) into quantidade from howviii.listar_minhas_ocorrencias();
  if quantidade <> 0 then
    raise exception 'Falha: outra identidade em request.jwt.claims recebeu % ocorrências; esperado 0', quantidade;
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
begin
  if has_function_privilege('anon', 'howviii.listar_minhas_ocorrencias()', 'EXECUTE') then
    raise exception 'Falha: anon possui EXECUTE na RPC PB13';
  end if;
  if not has_function_privilege('authenticated', 'howviii.listar_minhas_ocorrencias()', 'EXECUTE') then
    raise exception 'Falha: authenticated não possui EXECUTE na RPC PB13';
  end if;
end;
$$;

-- 6. Testa a policy diretamente como a role restrita que executa a RPC.
-- O primeiro formato deve permitir a linha do autor.
reset role;
set local role bairroativo_pb13_rpc_owner;
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

-- Outra identidade sem ocorrências próprias não deve ver linhas pela policy.
select set_config(
  'request.jwt.claims',
  jsonb_build_object('sub', current_setting('pb13.test.outro_usuario_id', true))::text,
  true
);

do $$
declare
  quantidade bigint;
begin
  select count(*) into quantidade from howviii.ocorrencias;
  if quantidade <> 0 then
    raise exception 'Falha: policy retornou % ocorrências para a outra identidade; esperado 0', quantidade;
  end if;
end;
$$;

-- Confirma que a chamada anon falha por privilégio, mesmo sem claims.
reset role;
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
