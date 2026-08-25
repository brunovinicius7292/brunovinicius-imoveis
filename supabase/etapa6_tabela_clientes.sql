-- =============================================================================
-- Catálogo de Imóveis — Tabela de Clientes (Etapa 6)
--
-- Objetivo:
--   Cadastro enxuto de clientes com chance real de negócio, usado pelo painel
--   admin em /admin/clientes. Diferente de `imoveis`, esta tabela é privada —
--   só o usuário autenticado (o corretor) pode ler/escrever, sem leitura
--   pública, já que são dados pessoais de clientes.
--
-- Campos:
--   - whatsapp: número digitado livremente no formulário (com ou sem
--     formatação); a formatação de exibição e o link wa.me são calculados
--     no painel, não gravados aqui.
--   - interesse_tipo: tipo de imóvel de interesse (casa, apartamento,
--     terreno...), texto livre — mesmo padrão do campo `tipo` de `imoveis`.
--   - valor_min / valor_max: faixa de orçamento que o cliente informou;
--     qualquer um dos dois pode ficar em branco.
--   - forma_pagamento: à vista, financiado ou indefinido (cliente ainda não
--     definiu ou o corretor não perguntou).
--   - temperatura: estimativa de quando o cliente deve fechar negócio —
--     quente (até 1 mês), morno (até 3 meses) ou frio (até 6 meses).
--
-- Este script é 100% aditivo e seguro para rodar mais de uma vez.
-- Cole o script inteiro de uma vez no SQL Editor do Supabase e rode.
-- =============================================================================

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  whatsapp text not null,
  interesse_tipo text,
  valor_min numeric,
  valor_max numeric,
  forma_pagamento text not null default 'indefinido'
    check (forma_pagamento in ('a_vista', 'financiado', 'indefinido')),
  temperatura text not null default 'morno'
    check (temperatura in ('frio', 'morno', 'quente')),
  observacoes text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- RLS: dados pessoais de clientes, acesso restrito a usuários autenticados
-- (o corretor logado no painel) — sem nenhuma política pública, diferente de
-- `imoveis` que tem leitura pública pelo site.
alter table clientes enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'clientes'
      and policyname = 'Acesso total a clientes para autenticados'
  ) then
    create policy "Acesso total a clientes para autenticados"
      on clientes for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;

-- Força a API (PostgREST) a recarregar o cache do schema imediatamente.
notify pgrst, 'reload schema';
