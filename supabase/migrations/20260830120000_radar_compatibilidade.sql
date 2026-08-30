-- =============================================================================
-- Radar de Compatibilidade — Clientes x Imóveis
--
-- Objetivo:
--   Base de dados para sugerir automaticamente imóveis compatíveis com cada
--   cliente cadastrado (e o inverso, clientes compatíveis com um imóvel),
--   sem depender de IA externa — o cálculo é feito em código
--   (lib/matching/compatibilidade.ts) a partir dos campos abaixo.
--
-- Mudanças:
--   1) clientes.interesse_tipos (text[]): permite selecionar mais de um tipo
--      de imóvel de interesse (ex.: Casa e Apartamento). A coluna antiga
--      `interesse_tipo` (texto único) é preservada intacta para não quebrar
--      registros existentes; seus dados são copiados para `interesse_tipos`
--      uma única vez (só entra em clientes que ainda não têm nada em
--      `interesse_tipos`, então é seguro rodar de novo).
--   2) clientes.quartos_min / vagas_min / financiamento: novos critérios de
--      match usados pelo radar (0 = indiferente nos dois primeiros).
--   3) imoveis.aceita_financiamento (boolean): critério forte do radar.
--   4) cliente_imoveis: tabela de relação que registra sugestões automáticas
--      e ações manuais do corretor por par cliente/imóvel — favoritar,
--      marcar como enviado, ocultar (não reaparece mais nas sugestões
--      automáticas, sem apagar o imóvel do estoque) e adicionar manualmente
--      (imóvel que não passaria pelas regras automáticas).
--
-- Este script é 100% aditivo e seguro para rodar mais de uma vez.
-- Cole o script inteiro de uma vez no SQL Editor do Supabase (ou rode via
-- Supabase CLI, ver instruções no final da tarefa) e rode.
-- =============================================================================

-- 1) Múltiplos tipos de imóvel de interesse do cliente -----------------------
alter table clientes add column if not exists interesse_tipos text[] not null default '{}';

update clientes
set interesse_tipos = array[interesse_tipo]
where interesse_tipo is not null
  and interesse_tipo <> ''
  and (interesse_tipos is null or interesse_tipos = '{}');

-- 2) Novos critérios de match no cliente --------------------------------------
alter table clientes add column if not exists quartos_min integer not null default 0
  check (quartos_min in (0, 1, 2, 3));

alter table clientes add column if not exists vagas_min integer not null default 0
  check (vagas_min in (0, 1, 2));

alter table clientes add column if not exists financiamento text not null default 'indiferente'
  check (financiamento in ('precisa_aceita', 'nao_aceita', 'indiferente'));

-- 3) Financiamento no imóvel ---------------------------------------------------
alter table imoveis add column if not exists aceita_financiamento boolean not null default false;

-- 4) Relação cliente x imóvel (radar de compatibilidade) ----------------------
create table if not exists cliente_imoveis (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  imovel_id uuid not null references imoveis(id) on delete cascade,
  origem text not null check (origem in ('automatica', 'manual')),
  estado text not null default 'sugerido'
    check (estado in ('sugerido', 'enviado', 'favorito', 'oculto')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (cliente_id, imovel_id)
);

create index if not exists cliente_imoveis_cliente_id_idx on cliente_imoveis (cliente_id);
create index if not exists cliente_imoveis_imovel_id_idx on cliente_imoveis (imovel_id);

-- RLS: mesmo padrão de `clientes` — dados privados do painel, só usuário
-- autenticado (o corretor) lê/escreve, sem leitura pública.
alter table cliente_imoveis enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'cliente_imoveis'
      and policyname = 'Acesso total a cliente_imoveis para autenticados'
  ) then
    create policy "Acesso total a cliente_imoveis para autenticados"
      on cliente_imoveis for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;

-- Força a API (PostgREST) a recarregar o cache do schema imediatamente.
notify pgrst, 'reload schema';
