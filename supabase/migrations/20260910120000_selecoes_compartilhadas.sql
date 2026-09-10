-- =============================================================================
-- Seleção de imóveis compartilhável por link (/selecao/<codigo>)
--
-- Contexto:
--   "Minha seleção" (/minha-selecao) vive só no localStorage do navegador de
--   quem está montando a lista — não tem id na URL, então não dá pra
--   compartilhar um link que abre com aqueles imóveis específicos (ver
--   components/public/SelecaoProvider.tsx). Esta tabela guarda uma CÓPIA
--   imutável de uma seleção no momento em que ela é compartilhada, associada
--   a um código curto e aleatório usado na URL pública /selecao/<codigo>.
--
--   Fluxo: corretor monta a seleção local -> clica em "Compartilhar seleção"
--   -> os ids atuais são salvos aqui com um código novo -> o link
--   /selecao/<codigo> passa a existir e funcionar pra sempre (ou até os
--   imóveis referenciados deixarem de existir/publicados), independente do
--   que acontecer depois com a seleção local (que pode ser limpa e
--   remontada livremente sem afetar nenhum link já compartilhado).
--
-- Segurança (importante — por que NÃO existe uma policy de SELECT aberta):
--   O projeto inteiro usa só a chave `anon` (pública, embutida no bundle do
--   navegador) — não existe service_role em nenhum lugar do código (ver
--   lib/supabase/client.ts e lib/supabase/server.ts). Se esta tabela tivesse
--   uma policy `select using (true)` para `anon`, qualquer pessoa poderia
--   chamar a API REST do Supabase diretamente e LISTAR todas as seleções de
--   todos os clientes de uma vez — o código deixaria de ser proteção
--   nenhuma. Por isso a tabela fica com RLS ligado e ZERO policies (acesso
--   direto negado por padrão para `anon` e `authenticated`), e a única forma
--   de ler ou criar uma linha é através das duas funções `security definer`
--   abaixo:
--     - obter_selecao_compartilhada(codigo): devolve NO MÁXIMO uma linha,
--       só quando o código bate exatamente — nunca lista.
--     - criar_selecao_compartilhada(codigo, imovel_ids): só insere. Não
--       existe função de update/delete exposta — uma vez criada, a
--       seleção é imutável.
--
-- Este script é aditivo e seguro para rodar mais de uma vez (idempotente).
-- Cole tudo no SQL Editor do Supabase e rode (ou `supabase db push`).
-- =============================================================================

-- 1) Tabela --------------------------------------------------------------
create table if not exists selecoes_compartilhadas (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  imovel_ids uuid[] not null,
  criado_em timestamptz not null default now(),
  constraint selecoes_compartilhadas_tamanho_valido
    check (coalesce(array_length(imovel_ids, 1), 0) between 1 and 50)
);

create index if not exists selecoes_compartilhadas_codigo_idx
  on selecoes_compartilhadas (codigo);

-- 2) RLS: liga e NÃO cria nenhuma policy — acesso direto à tabela fica
--    negado por padrão pra anon e authenticated. Só as funções abaixo
--    (security definer) conseguem ler/escrever.
alter table selecoes_compartilhadas enable row level security;

-- 3) Funções (security definer) -------------------------------------------
create or replace function criar_selecao_compartilhada(p_codigo text, p_imovel_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into selecoes_compartilhadas (codigo, imovel_ids)
  values (p_codigo, p_imovel_ids);
end;
$$;

create or replace function obter_selecao_compartilhada(p_codigo text)
returns table (imovel_ids uuid[], criado_em timestamptz)
language sql
security definer
set search_path = public
as $$
  select s.imovel_ids, s.criado_em
  from selecoes_compartilhadas s
  where s.codigo = p_codigo;
$$;

-- 4) Permissão para chamar as funções (a tabela em si continua fechada) ---
grant execute on function criar_selecao_compartilhada(text, uuid[]) to anon, authenticated;
grant execute on function obter_selecao_compartilhada(text) to anon, authenticated;

-- 5) Recarrega o cache de schema da API (PostgREST)
notify pgrst, 'reload schema';


-- =============================================================================
-- VERIFICAÇÃO (rode separado, depois de aplicar) — nada aqui altera dados
-- =============================================================================
-- 5.1) RLS ligado e sem nenhuma policy na tabela:
--
--   select relrowsecurity as rls_ligado
--   from pg_class where relname = 'selecoes_compartilhadas';
--   -- esperado: true
--
--   select count(*) as policies_na_tabela
--   from pg_policies where tablename = 'selecoes_compartilhadas';
--   -- esperado: 0
--
-- 5.2) Simular um VISITANTE (anon) tentando ler a tabela direto — deve
--      vir vazio mesmo com linhas existentes (RLS bloqueia, sem policy):
--
--   begin;
--   set local role anon;
--   select count(*) from selecoes_compartilhadas;  -- esperado: 0
--   rollback;
--
-- 5.3) Testar as funções (como anon, dentro de uma transação de teste que é
--      desfeita no final — não deixa lixo no banco):
--
--   begin;
--   set local role anon;
--   select criar_selecao_compartilhada('TESTE-VAZIO', array[]::uuid[]);
--   -- esperado: ERRO (viola o check de tamanho — array vazio)
--   rollback;
--
--   -- troque '<uuid-de-um-imovel>' por um id real de imóvel publicado:
--   begin;
--   set local role anon;
--   select criar_selecao_compartilhada('TESTE123AB', array['<uuid-de-um-imovel>']::uuid[]);
--   select * from obter_selecao_compartilhada('TESTE123AB');        -- 1 linha
--   select * from obter_selecao_compartilhada('CODIGO-INEXISTENTE'); -- 0 linhas
--   rollback;  -- desfaz a inserção de teste, não fica nada salvo
-- =============================================================================


-- =============================================================================
-- ROLLBACK (só se precisar desfazer tudo):
--
--   drop function if exists criar_selecao_compartilhada(text, uuid[]);
--   drop function if exists obter_selecao_compartilhada(text);
--   drop table if exists selecoes_compartilhadas;
--   notify pgrst, 'reload schema';
-- =============================================================================
