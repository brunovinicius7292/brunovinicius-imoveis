-- =============================================================================
-- RLS de `imoveis` e `imovel_fotos` — leitura pública, escrita só do corretor
--
-- Contexto (como o corretor é identificado hoje):
--   O app inteiro usa APENAS a chave pública (anon) do Supabase — tanto o site
--   público quanto a Área do Corretor (ver lib/supabase/client.ts,
--   lib/supabase/server.ts, middleware.ts). Não existe service_role no código.
--   O corretor entra pela tela /login com e-mail e senha
--   (supabase.auth.signInWithPassword) e, a partir daí, todas as consultas do
--   painel viajam com a SESSÃO dele. Não há coluna nem papel de "admin": para
--   este projeto, quem está logado no Supabase Auth É o corretor. Visitante do
--   site = não logado = papel `anon`.
--
--   Portanto as regras abaixo são:
--     - `authenticated` (o corretor logado)  -> acesso TOTAL
--     - `anon` (visitante)                   -> só leitura de imóveis públicos
--
-- O que este script faz:
--   imoveis:
--     - anon           : SELECT apenas de linhas com publicado = true
--     - authenticated  : SELECT / INSERT / UPDATE / DELETE de tudo
--   imovel_fotos:
--     - anon           : SELECT apenas de fotos cujo imóvel tem publicado = true
--                        (fotos de rascunho / não publicado ficam invisíveis)
--     - authenticated  : SELECT / INSERT / UPDATE / DELETE de tudo
--   clientes / cliente_imoveis / cliente_atividades:
--     - apenas reforça `enable row level security` (as políticas
--       "só autenticado" já foram criadas em etapa6_tabela_clientes.sql,
--       20260830120000_radar_compatibilidade.sql e
--       20260830140000_cliente_atividades.sql). Visitante não acessa nada.
--
-- Segurança deste script:
--   - Não altera dados. Não cria/apaga tabelas. Não toca em nenhuma chave.
--   - Idempotente: pode rodar mais de uma vez (drop policy if exists + create).
--   - NÃO tranca o corretor para fora: as políticas de `authenticated` são
--     criadas no MESMO script em que o RLS é ligado.
--
-- FORA DO ESCOPO DESTE SQL (é configuração de projeto, não de banco):
--   Desligar o cadastro público de contas no Supabase Auth. Como qualquer
--   usuário logado vira corretor, o "Allow new users to sign up" PRECISA
--   estar DESLIGADO no painel (Authentication > Sign In / Providers > Email).
--   Confira antes de aplicar esta migração.
--
-- Como aplicar: cole tudo no SQL Editor do Supabase e rode (ou
--   `supabase db push` se você usa o CLI). Depois rode os blocos de
--   verificação no fim do arquivo.
-- =============================================================================

-- 1) imoveis -----------------------------------------------------------------
alter table public.imoveis enable row level security;

drop policy if exists "Leitura publica de imoveis publicados" on public.imoveis;
create policy "Leitura publica de imoveis publicados"
  on public.imoveis for select
  to anon
  using (publicado = true);

drop policy if exists "Corretor le todos os imoveis" on public.imoveis;
create policy "Corretor le todos os imoveis"
  on public.imoveis for select
  to authenticated
  using (true);

drop policy if exists "Corretor insere imoveis" on public.imoveis;
create policy "Corretor insere imoveis"
  on public.imoveis for insert
  to authenticated
  with check (true);

drop policy if exists "Corretor atualiza imoveis" on public.imoveis;
create policy "Corretor atualiza imoveis"
  on public.imoveis for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Corretor apaga imoveis" on public.imoveis;
create policy "Corretor apaga imoveis"
  on public.imoveis for delete
  to authenticated
  using (true);

-- 2) imovel_fotos ----------------------------------------------------------
alter table public.imovel_fotos enable row level security;

-- Visitante (anon): só vê a foto se o imóvel dono dela estiver publicado.
-- O `and i.publicado = true` explícito garante o comportamento mesmo que a
-- RLS de `imoveis` mude no futuro.
drop policy if exists "Leitura publica das fotos de imoveis (tabela)" on public.imovel_fotos;
create policy "Leitura publica das fotos de imoveis (tabela)"
  on public.imovel_fotos for select
  to anon
  using (
    exists (
      select 1
      from public.imoveis i
      where i.id = imovel_fotos.imovel_id
        and i.publicado = true
    )
  );

-- Corretor (authenticated): vê todas as fotos, inclusive de rascunhos.
drop policy if exists "Corretor le todas as fotos de imoveis" on public.imovel_fotos;
create policy "Corretor le todas as fotos de imoveis"
  on public.imovel_fotos for select
  to authenticated
  using (true);

drop policy if exists "Corretor insere fotos de imoveis" on public.imovel_fotos;
create policy "Corretor insere fotos de imoveis"
  on public.imovel_fotos for insert
  to authenticated
  with check (true);

drop policy if exists "Corretor atualiza fotos de imoveis" on public.imovel_fotos;
create policy "Corretor atualiza fotos de imoveis"
  on public.imovel_fotos for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Corretor apaga fotos de imoveis" on public.imovel_fotos;
create policy "Corretor apaga fotos de imoveis"
  on public.imovel_fotos for delete
  to authenticated
  using (true);

-- 3) Reforço: CRM continua fechado para visitante -------------------------
--    (as políticas "só autenticado" dessas tabelas já existem; isto só
--    garante que o RLS esteja ligado mesmo que algo tenha desligado)
alter table public.clientes           enable row level security;
alter table public.cliente_imoveis    enable row level security;
alter table public.cliente_atividades enable row level security;

-- 4) Recarrega o cache de schema da API (PostgREST)
notify pgrst, 'reload schema';


-- =============================================================================
-- VERIFICAÇÃO (rode separado, depois de aplicar) — nada aqui altera dados
-- =============================================================================
-- 4.1) RLS ligado em todas as tabelas?  (rls_ligado deve ser true nas 5)
--
--   select relname as tabela, relrowsecurity as rls_ligado
--   from pg_class
--   where relnamespace = 'public'::regnamespace
--     and relname in ('imoveis','imovel_fotos','clientes',
--                     'cliente_imoveis','cliente_atividades')
--   order by relname;
--
-- 4.2) Políticas existentes:
--
--   select tablename, policyname, roles, cmd
--   from pg_policies
--   where schemaname = 'public'
--   order by tablename, cmd, policyname;
--
-- 4.3) Simular um VISITANTE (anon) — dentro de uma transação para reverter:
--
--   begin;
--   set local role anon;
--   select count(*) as publicos_visiveis   from public.imoveis;
--   select count(*) as rascunhos_vazando   from public.imoveis where publicado = false;  -- deve ser 0
--   select count(*) as clientes_vazando    from public.clientes;   -- 0 linhas ou erro de permissão = OK (bloqueado)
--   -- fotos: nenhuma foto de imóvel NÃO publicado pode aparecer para o anon
--   select count(*) as fotos_de_rascunho_vazando
--   from public.imovel_fotos f
--   where not exists (
--     select 1 from public.imoveis i
--     where i.id = f.imovel_id and i.publicado = true
--   );  -- deve ser 0
--   rollback;
--
--   Esperado: `publicos_visiveis` = qtd de imóveis publicados,
--             `rascunhos_vazando` = 0,
--             `clientes_vazando`  = 0 (ou erro "permission denied"),
--             `fotos_de_rascunho_vazando` = 0.
--
-- 4.4) Teste real do corretor: faça login em /login, abra /admin, liste
--      imóveis e clientes, edite um campo de teste num imóvel e salve, e
--      confira que as fotos aparecem tanto num imóvel publicado quanto num
--      rascunho. Tudo deve funcionar igual a antes.
-- =============================================================================


-- =============================================================================
-- ROLLBACK (só se algo inesperado acontecer — volta ao estado sem RLS nessas
-- duas tabelas; NÃO mexe no CRM):
--
--   alter table public.imoveis      disable row level security;
--   alter table public.imovel_fotos disable row level security;
--   notify pgrst, 'reload schema';
-- =============================================================================
