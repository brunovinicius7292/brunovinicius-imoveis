-- =============================================================================
-- Clientes — Finalidade (Venda ou Aluguel) (Etapa 7)
--
-- Objetivo:
--   Separar os clientes cadastrados em /admin/clientes em duas listas:
--   clientes com interesse em comprar ("venda") e clientes com interesse em
--   alugar ("aluguel"). Diferente de `imoveis`, aqui não existe a opção
--   "venda_aluguel" — cada cliente tem um interesse só, nunca os dois ao
--   mesmo tempo.
--
-- Este script é 100% aditivo e seguro para rodar mais de uma vez:
--   - Clientes já cadastrados recebem `finalidade = 'venda'` por padrão.
--
-- Cole o script inteiro de uma vez no SQL Editor do Supabase e rode.
-- =============================================================================

alter table clientes
  add column if not exists finalidade text not null default 'venda'
    check (finalidade in ('venda', 'aluguel'));

-- Força a API (PostgREST) a recarregar o cache do schema imediatamente.
notify pgrst, 'reload schema';
