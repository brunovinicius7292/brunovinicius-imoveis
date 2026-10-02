-- =============================================================================
-- Momento comercial do cliente — novo valor "encerrado_sem_negocio"
--
-- Objetivo:
--   Ampliar clientes.momento (ver
--   supabase/migrations/20261002120000_clientes_momento_comercial.sql) com
--   uma quarta etapa: cliente que não está mais procurando imóvel com a
--   imobiliária, mas sem ter fechado negócio (foi pra outra imobiliária,
--   desistiu, parou de responder, sem perfil no momento, outro motivo) — o
--   cliente continua existindo normalmente, com perfil, histórico e dados
--   preservados, só sai do radar automático (ver
--   lib/matching/compatibilidade.ts) e fica fora da lista de clientes
--   ativos, numa aba própria em /admin/clientes.
--
--   Também adiciona `motivo_encerramento`, usado só quando
--   `momento = 'encerrado_sem_negocio'` (a aplicação zera esse campo sempre
--   que o momento muda pra qualquer outro valor).
--
-- Aditiva e segura pra rodar mais de uma vez:
--   - Recria o check de `momento` incluindo o novo valor (os valores antigos
--     continuam válidos, nenhuma linha existente é alterada).
--   - `motivo_encerramento` entra como coluna nova, opcional (null para
--     todos os clientes já cadastrados).
--   - Nenhum dado existente é apagado ou sobrescrito.
-- =============================================================================

alter table clientes drop constraint if exists clientes_momento_check;

alter table clientes
  add constraint clientes_momento_check check (momento in (
    'buscando',
    'em_negociacao',
    'fechado',
    'encerrado_sem_negocio'
  ));

alter table clientes
  add column if not exists motivo_encerramento text
    check (motivo_encerramento in (
      'fechou_com_outra',
      'desistiu',
      'sem_retorno',
      'sem_perfil_momento',
      'outro'
    ));

-- Força a API (PostgREST) a recarregar o cache do schema imediatamente.
notify pgrst, 'reload schema';
