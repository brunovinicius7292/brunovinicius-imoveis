-- =============================================================================
-- Catálogo de Imóveis — Nova finalidade "Venda e Aluguel" (Etapa 5)
--
-- Objetivo:
--   Permitir que um imóvel seja cadastrado como "venda_aluguel" (Venda e
--   Aluguel), além dos valores já existentes "venda" e "aluguel", e
--   armazenar o valor do aluguel separadamente para esse caso.
--
-- Este script é 100% aditivo e seguro para rodar mais de uma vez:
--   - Nenhum imóvel existente é alterado ou apagado.
--   - Funciona independentemente de `finalidade` ter sido criada como enum
--     ou como texto (text/varchar) — detecta e converte automaticamente.
--   - Imóveis com finalidade "venda" ou "aluguel" continuam funcionando
--     exatamente como antes (a coluna `preco` mantém o mesmo significado
--     de sempre: valor de venda quando finalidade = "venda", valor do
--     aluguel quando finalidade = "aluguel").
--   - A nova coluna `preco_aluguel` é criada como NULL para todos os
--     imóveis já cadastrados.
--
-- Cole o script inteiro de uma vez no SQL Editor do Supabase e rode.
-- =============================================================================

-- 1) Nova coluna para o valor do aluguel (usada apenas quando
--    finalidade = 'venda_aluguel'). Resolve o erro atual de gravação.
alter table imoveis add column if not exists preco_aluguel numeric null;

-- 2) Garante que `finalidade` seja uma coluna de texto simples (funciona
--    mesmo se já for texto — nesse caso o cast é inofensivo). Se hoje for
--    um enum, converte para texto preservando todos os valores existentes.
alter table imoveis
  alter column finalidade type text using finalidade::text;

-- 3) Remove qualquer CHECK constraint antigo sobre `finalidade` (com
--    qualquer nome) e recria já permitindo o novo valor 'venda_aluguel'.
do $$
declare
  nome_constraint text;
begin
  select conname into nome_constraint
  from pg_constraint
  where conrelid = 'imoveis'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%finalidade%';

  if nome_constraint is not null then
    execute format('alter table imoveis drop constraint %I', nome_constraint);
  end if;

  execute 'alter table imoveis add constraint imoveis_finalidade_check
    check (finalidade in (''venda'', ''aluguel'', ''venda_aluguel''))';
end $$;

-- 4) Força a API (PostgREST) a recarregar o cache do schema imediatamente,
--    em vez de esperar a detecção automática. Sem isso, a API pode continuar
--    reportando "Could not find the 'preco_aluguel' column ... in the schema
--    cache" por alguns minutos mesmo depois da coluna já existir.
notify pgrst, 'reload schema';
