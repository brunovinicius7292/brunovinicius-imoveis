import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Imovel } from "@/lib/types/imovel";

function mapRowParaImovelAdmin(row: any): Imovel {
  return {
    id: row.id,
    codigo: row.codigo ?? undefined,
    titulo: row.titulo,
    descricao: row.descricao ?? undefined,
    tipo: row.tipo,
    finalidade: row.finalidade,
    preco: Number(row.preco),
    precoAluguel: row.preco_aluguel != null ? Number(row.preco_aluguel) : undefined,
    cidade: row.cidade,
    bairro: row.bairro,
    quartos: row.quartos,
    banheiros: row.banheiros,
    vagas: row.vagas,
    areaM2: Number(row.area_m2),
    fotoCapaUrl: "",
    videoYoutubeUrl: row.video_youtube_url ?? undefined,
    destaque: row.destaque,
    publicado: row.publicado,
    status: row.status,
    slug: row.slug,
  };
}

// Todos os imóveis, para a tabela do painel (sem filtro de status/destaque —
// isso é o que diferencia da busca usada no site público).
export async function getImoveisAdmin(): Promise<Imovel[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("imoveis")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao buscar imóveis (admin):", error.message);
    return [];
  }

  return (data ?? []).map(mapRowParaImovelAdmin);
}

// Um imóvel pelo id, para a tela de edição do painel.
export async function getImovelPorId(id: string): Promise<Imovel | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("imoveis")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar imóvel pelo id:", error.message);
    return null;
  }

  return data ? mapRowParaImovelAdmin(data) : null;
}

export interface FotoImovel {
  id: string;
  url: string; // caminho salvo no Storage, não a URL pública
}

// Fotos de um imóvel com id (necessário para excluir), diferente da versão
// pública em lib/supabase/imoveis.ts que retorna só as URLs.
export async function getFotosAdmin(imovelId: string): Promise<FotoImovel[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("imovel_fotos")
    .select("id, url")
    .eq("imovel_id", imovelId)
    .order("ordem", { ascending: true });

  if (error) {
    console.error("Erro ao buscar fotos do imóvel (admin):", error.message);
    return [];
  }

  return data ?? [];
}
