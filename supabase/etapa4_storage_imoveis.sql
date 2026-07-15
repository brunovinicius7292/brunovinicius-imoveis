-- =============================================================================
-- Catálogo de Imóveis — Configuração do Supabase Storage
-- Cria o bucket "imoveis" e as políticas de acesso:
--   - Leitura pública dos arquivos.
--   - Upload e exclusão restritos a usuários autenticados.
-- Alinhado à Seção 6 do PROJECT.md ("Storage: leitura pública dos arquivos;
-- upload/delete restrito a autenticados").
-- Não cria nenhuma tabela nova — usa a `imovel_fotos` já existente.
-- =============================================================================

-- Bucket público chamado "imoveis"
insert into storage.buckets (id, name, public)
values ('imoveis', 'imoveis', true)
on conflict (id) do nothing;

-- Leitura pública dos arquivos do bucket "imoveis"
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Leitura publica das fotos de imoveis'
  ) then
    create policy "Leitura publica das fotos de imoveis"
      on storage.objects for select
      using (bucket_id = 'imoveis');
  end if;
end $$;

-- Upload restrito a usuários autenticados
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Upload autenticado de fotos de imoveis'
  ) then
    create policy "Upload autenticado de fotos de imoveis"
      on storage.objects for insert
      to authenticated
      with check (bucket_id = 'imoveis');
  end if;
end $$;

-- Exclusão restrita a usuários autenticados
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Exclusao autenticada de fotos de imoveis'
  ) then
    create policy "Exclusao autenticada de fotos de imoveis"
      on storage.objects for delete
      to authenticated
      using (bucket_id = 'imoveis');
  end if;
end $$;
