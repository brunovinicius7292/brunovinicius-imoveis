-- =============================================================================
-- Inverte o padrão comercial de `imoveis.aceita_financiamento`
--
-- Objetivo:
--   A coluna `aceita_financiamento` (criada em
--   20260830120000_radar_compatibilidade.sql) nasceu com padrão `false` e um
--   checkbox "Aceita financiamento" no formulário. Na prática, a maioria dos
--   imóveis aceita financiamento — o padrão comercial correto é o oposto: só
--   marcar quando o imóvel NÃO aceita.
--
--   O SIGNIFICADO da coluna não muda (true = aceita, false = não aceita) —
--   só o padrão e a forma como o formulário pergunta isso (ver
--   components/admin/ImovelForm.tsx).
--
-- Mudanças:
--   1) Novo padrão da coluna: `true`.
--   2) Todos os imóveis já cadastrados passam a `aceita_financiamento = true`
--      — eles foram criados antes dessa informação existir (o formulário
--      nunca teve esse campo até agora), então o valor atual (`false`,
--      herdado do padrão antigo da coluna) não reflete a realidade. Isso é
--      uma correção de dado, não uma regra nova: o corretor pode voltar a
--      marcar `false` manualmente em qualquer imóvel específico que não
--      aceite financiamento.
--
-- 100% aditivo e seguro para rodar mais de uma vez.
-- =============================================================================

alter table imoveis alter column aceita_financiamento set default true;

update imoveis set aceita_financiamento = true where aceita_financiamento = false;

-- Força a API (PostgREST) a recarregar o cache do schema imediatamente.
notify pgrst, 'reload schema';
