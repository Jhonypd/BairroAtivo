-- Proposta para revisão: NÃO executar antes da revisão da política de segurança.
-- A função deriva a identidade exclusivamente de auth.uid(), sem aceitar um
-- identificador de usuário como argumento e sem retornar autor_id.
-- Revisão de permissões necessária: hoje authenticated tem UPDATE em status.
-- A revogação da tabela impede que chamadas diretas do cliente mudem status ou
-- campos internos; o GRANT abaixo libera somente os campos editáveis da PB13.
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
set search_path = pg_catalog
as $$
  select o.id, o.titulo, o.descricao, o.categoria, o.bairro,
         o.status, o.criado_em, o.nome_publico
  from howviii.ocorrencias as o
  where o.autor_id = (select auth.uid())
  order by o.criado_em desc;
$$;

revoke all on function howviii.listar_minhas_ocorrencias() from public, anon;
grant execute on function howviii.listar_minhas_ocorrencias() to authenticated;
