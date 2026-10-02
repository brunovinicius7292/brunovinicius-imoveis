-- =============================================================================
-- Momento comercial do cliente (etapa do atendimento)
--
-- Objetivo:
--   Organizar os clientes do CRM pela etapa atual do atendimento,
--   independente da finalidade (venda/aluguel, ver
--   supabase/migrations/20260825184229_clientes_finalidade.sql):
--     - buscando: cliente está procurando imóvel (padrão).
--     - em_negociacao: cliente está negociando um imóvel.
--     - fechado: cliente fechou negócio.
--
--   Usado para: (1) separar a lista /admin/clientes em "Em busca" / "Em
--   negociação" / "Negócios fechados" dentro de cada finalidade; (2) tirar
--   clientes "fechado" do Radar de Compatibilidade automático (ver
--   lib/matching/compatibilidade.ts), sem apagar relações, favoritos,
--   enviados, ocultados ou atividades já existentes.
--
-- Aditiva e segura pra rodar mais de uma vez:
--   - Clientes já cadastrados recebem `momento = 'buscando'` por padrão.
--   - Nenhum dado existente é alterado ou apagado.
-- =============================================================================

alter table clientes
  add column if not exists momento text not null default 'buscando'
    check (momento in ('buscando', 'em_negociacao', 'fechado'));

-- Novo tipo de atividade para o histórico do cliente (ver
-- supabase/migrations/20260830140000_cliente_atividades.sql) — registrado
-- quando o corretor muda o momento comercial na página de perfil.
alter table cliente_atividades drop constraint if exists cliente_atividades_tipo_check;

alter table cliente_atividades
  add constraint cliente_atividades_tipo_check check (tipo in (
    'oferta_whatsapp',
    'marcado_enviado',
    'favoritado',
    'ocultado',
    'reexibido',
    'adicionado_manual',
    'nota_manual',
    'momento_alterado'
  ));

-- Força a API (PostgREST) a recarregar o cache do schema imediatamente.
notify pgrst, 'reload schema';
