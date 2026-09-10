import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface SelecaoCompartilhada {
  imovelIds: string[];
  criadoEm: string;
}

// Busca uma seleção compartilhada pelo código curto da URL
// (/selecao/<codigo>). Passa pela função obter_selecao_compartilhada
// (security definer, ver migration) em vez de consultar a tabela
// diretamente — a tabela fica fechada por RLS (nenhuma policy de SELECT
// para anon/authenticated), então só é possível buscar por código exato,
// nunca listar todas as seleções.
export async function getSelecaoCompartilhada(
  codigo: string
): Promise<SelecaoCompartilhada | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .rpc("obter_selecao_compartilhada", { p_codigo: codigo })
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar seleção compartilhada:", error.message);
    return null;
  }

  if (!data) return null;

  const linha = data as { imovel_ids: string[]; criado_em: string };
  return { imovelIds: linha.imovel_ids ?? [], criadoEm: linha.criado_em };
}
