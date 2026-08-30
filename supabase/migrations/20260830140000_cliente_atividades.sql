-- =============================================================================
-- Histórico de atividades do cliente (página de perfil /admin/clientes/[id])
--
-- Objetivo:
--   Registrar automaticamente as ações comerciais feitas em cima de um
--   cliente — ofertar um imóvel pelo WhatsApp, marcar como enviado,
--   favoritar, ocultar, reexibir e adicionar manualmente (mesmas ações já
--   existentes do Radar de Compatibilidade, ver
--   supabase/migrations/20260830120000_radar_compatibilidade.sql) — além de
--   permitir uma nota manual curta (texto livre) direto na página de
--   perfil. A tabela é só um log de eventos: não substitui nem altera
--   `cliente_imoveis`.
--
-- Campos:
--   - imovel_id: opcional (nem toda atividade tem imóvel — ex.: nota
--     manual). `on delete set null` para o histórico sobreviver mesmo se o
--     imóvel for excluído do estoque depois.
--   - tipo: um dos eventos rastreados (ver check abaixo).
--   - descricao: texto livre, usado principalmente pela nota manual.
--
-- 100% aditivo e seguro para rodar mais de uma vez.
-- =============================================================================

create table if not exists cliente_atividades (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  imovel_id uuid references imoveis(id) on delete set null,
  tipo text not null check (tipo in (
    'oferta_whatsapp',
    'marcado_enviado',
    'favoritado',
    'ocultado',
    'reexibido',
    'adicionado_manual',
    'nota_manual'
  )),
  descricao text,
  criado_em timestamptz not null default now()
);

create index if not exists cliente_atividades_cliente_id_idx on cliente_atividades (cliente_id);
create index if not exists cliente_atividades_imovel_id_idx on cliente_atividades (imovel_id);

-- RLS: mesmo padrão privado das outras tabelas do CRM (clientes,
-- cliente_imoveis) — só usuário autenticado (o corretor) lê/escreve, sem
-- leitura pública.
alter table cliente_atividades enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'cliente_atividades'
      and policyname = 'Acesso total a cliente_atividades para autenticados'
  ) then
    create policy "Acesso total a cliente_atividades para autenticados"
      on cliente_atividades for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;

-- Força a API (PostgREST) a recarregar o cache do schema imediatamente.
notify pgrst, 'reload schema';
