-- =============================================================================
-- Clientes — Finalidade (Venda ou Aluguel)
--
-- Objetivo:
--   Separar os clientes cadastrados em /admin/clientes em duas listas:
--   clientes com interesse em comprar ("venda") e clientes com interesse em
--   alugar ("aluguel"). Diferente de `imoveis`, aqui não existe a opção
--   "venda_aluguel" — cada cliente tem um interesse só, nunca os dois ao
--   mesmo tempo.
--
--   Mesma mudança já descrita em supabase/etapa7_clientes_finalidade.sql
--   (mantido como histórico) — esta é a versão rastreada pelo Supabase CLI.
--
-- Aditiva e segura pra rodar mais de uma vez:
--   - Clientes já cadastrados recebem `finalidade = 'venda'` por padrão.
-- =============================================================================

alter table clientes
  add column if not exists finalidade text not null default 'venda'
    check (finalidade in ('venda', 'aluguel'));

-- Força a API (PostgREST) a recarregar o cache do schema imediatamente.
notify pgrst, 'reload schema';
