
-- Fotos de ocorrências ficam em bucket privado. O banco armazena somente a chave.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fotos-ocorrencias',
  'fotos-ocorrencias',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set name = excluded.name,
    public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- As tabelas permanecem protegidas pelas políticas RLS existentes de autoria.
grant select on howviii.ocorrencias, howviii.fotos_ocorrencias to anon, authenticated;
grant insert, update, delete on howviii.ocorrencias, howviii.fotos_ocorrencias to authenticated;

drop policy if exists "PB19 leitura de fotos vinculadas" on storage.objects;
create policy "PB19 leitura de fotos vinculadas"
on storage.objects for select to anon, authenticated
using (
  bucket_id = 'fotos-ocorrencias'
  and exists (
    select 1
    from howviii.fotos_ocorrencias f
    join howviii.ocorrencias o on o.id = f.ocorrencia_id
    where f.caminho_arquivo = storage.objects.name
      and o.id::text = (storage.foldername(storage.objects.name))[1]
  )
);

drop policy if exists "PB19 autor envia fotos da ocorrencia" on storage.objects;
create policy "PB19 autor envia fotos da ocorrencia"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'fotos-ocorrencias'
  and exists (
    select 1
    from howviii.ocorrencias o
    where o.id::text = (storage.foldername(storage.objects.name))[1]
      and o.autor_id = (select auth.uid())
  )
);

drop policy if exists "PB19 autor remove fotos da ocorrencia" on storage.objects;
create policy "PB19 autor remove fotos da ocorrencia"
on storage.objects for delete to authenticated
using (
  bucket_id = 'fotos-ocorrencias'
  and exists (
    select 1
    from howviii.ocorrencias o
    where o.id::text = (storage.foldername(storage.objects.name))[1]
      and o.autor_id = (select auth.uid())
  )
);
