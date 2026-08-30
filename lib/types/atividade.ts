// Tipagem alinhada à tabela `cliente_atividades` (histórico de atividades da
// página de perfil do cliente — ver
// supabase/migrations/20260830140000_cliente_atividades.sql).

export type TipoAtividade =
  | "oferta_whatsapp" // clicou em "Ofertar no WhatsApp" (já marca como enviado também, ver lib/supabase/atividades-admin.ts)
  | "marcado_enviado"
  | "favoritado"
  | "ocultado"
  | "reexibido" // voltou a aparecer nas sugestões depois de oculto
  | "adicionado_manual"
  | "nota_manual"; // texto livre digitado pelo corretor na página de perfil

export interface AtividadeCliente {
  id: string;
  clienteId: string;
  imovelId?: string;
  tipo: TipoAtividade;
  descricao?: string;
  criadoEm: string;
  // Presente só quando `imovelId` existe e o imóvel ainda não foi excluído.
  imovel?: { id: string; titulo: string; slug: string } | null;
}
