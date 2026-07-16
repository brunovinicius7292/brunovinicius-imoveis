import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Imovel } from "@/lib/types/imovel";
import { capitalizarPalavras, chaveNormalizada } from "@/lib/utils/texto";

type ClienteSupabase = ReturnType<typeof createSupabaseServerClient>;

export interface FiltrosImoveis {
  cidade?: string;
  bairro?: string;
  categoria?: string;
  finalidade?: string;
  precoMin?: number;
  precoMax?: number;
  quartosMin?: number;
  banheirosMin?: number;
  vagasMin?: number;
  ordenarPor?: string;
}

// Aplica, de forma incremental, apenas os filtros que vieram preenchidos —
// usado tanto na busca dos destaques quanto na busca geral, para que os
// dois respeitem exatamente os mesmos critérios.
function aplicarFiltros(query: any, filtros?: FiltrosImoveis) {
  let resultado = query;

  if (!filtros) return resultado;

  if (filtros.cidade) {
    resultado = resultado.ilike("cidade", `%${filtros.cidade}%`);
  }
  if (filtros.bairro) {
    resultado = resultado.ilike("bairro", `%${filtros.bairro}%`);
  }
  if (filtros.categoria) {
    // `categoria` chega normalizada (ver getCategoriasDisponiveis) — ilike sem
    // "%" faz comparação exata, mas ignorando maiúsculas/minúsculas, o que
    // cobre a mesma variação de grafia que a normalização de exibição trata.
    resultado = resultado.ilike("tipo", filtros.categoria);
  }
  // "venda"/"aluguel" também deve trazer imóveis "venda_aluguel", já que estes
  // atendem às duas finalidades ao mesmo tempo.
  if (filtros.finalidade === "venda" || filtros.finalidade === "aluguel") {
    resultado = resultado.in("finalidade", [filtros.finalidade, "venda_aluguel"]);
  } else if (filtros.finalidade) {
    resultado = resultado.eq("finalidade", filtros.finalidade);
  }
  if (filtros.precoMin != null) {
    resultado = resultado.gte("preco", filtros.precoMin);
  }
  if (filtros.precoMax != null) {
    resultado = resultado.lte("preco", filtros.precoMax);
  }
  if (filtros.quartosMin != null) {
    resultado = resultado.gte("quartos", filtros.quartosMin);
  }
  if (filtros.banheirosMin != null) {
    resultado = resultado.gte("banheiros", filtros.banheirosMin);
  }
  if (filtros.vagasMin != null) {
    resultado = resultado.gte("vagas", filtros.vagasMin);
  }

  return resultado;
}

// Define a ordenação da busca — usada igualmente pelos Destaques e pela
// busca geral (que alimenta as seções de Venda e Aluguel), para que os três
// respeitem a mesma opção escolhida em "Ordenar por".
function aplicarOrdenacao(query: any, ordenarPor?: string) {
  switch (ordenarPor) {
    case "menor-preco":
      return query.order("preco", { ascending: true });
    case "maior-preco":
      return query.order("preco", { ascending: false });
    case "maior-area":
      return query.order("area_m2", { ascending: false });
    default:
      return query.order("criado_em", { ascending: false });
  }
}

// Converte o caminho salvo no banco (Storage) na URL pública do arquivo.
function obterUrlPublicaFoto(supabase: ClienteSupabase, caminho: string) {
  return supabase.storage.from("imoveis").getPublicUrl(caminho).data.publicUrl;
}

// Converte uma linha da tabela `imoveis` (snake_case), já com as fotos
// relacionadas (`imovel_fotos`), para o tipo `Imovel` usado pelos componentes.
function mapRowParaImovel(row: any, supabase: ClienteSupabase): Imovel {
  const fotos = (row.imovel_fotos ?? []) as { url: string; ordem: number }[];
  const capa =
    fotos.length > 0
      ? [...fotos].sort((a, b) => a.ordem - b.ordem)[0]
      : null;

  return {
    id: row.id,
    codigo: row.codigo ?? undefined,
    titulo: row.titulo,
    descricao: row.descricao ?? undefined,
    tipo: row.tipo,
    finalidade: row.finalidade,
    preco: Number(row.preco),
    precoAluguel: row.preco_aluguel != null ? Number(row.preco_aluguel) : undefined,
    condominio: row.condominio != null ? Number(row.condominio) : undefined,
    iptu: row.iptu != null ? Number(row.iptu) : undefined,
    aceitaFinanciamento: row.aceita_financiamento,
    aceitaFgts: row.aceita_fgts,
    cidade: row.cidade,
    bairro: row.bairro,
    quartos: row.quartos,
    banheiros: row.banheiros,
    vagas: row.vagas,
    areaM2: Number(row.area_m2),
    fotoCapaUrl: capa ? obterUrlPublicaFoto(supabase, capa.url) : "",
    videoYoutubeUrl: row.video_youtube_url ?? undefined,
    destaque: row.destaque,
    publicado: row.publicado,
    status: row.status,
    slug: row.slug,
  };
}

// Imóveis em destaque para a Home pública:
// status disponível + destaque = true + publicado = true (+ filtros da busca)
export async function getImoveisDestaque(
  filtros?: FiltrosImoveis
): Promise<Imovel[]> {
  const supabase = createSupabaseServerClient();

  let query = supabase
    .from("imoveis")
    .select("*, imovel_fotos(url, ordem)")
    .eq("status", "disponivel")
    .eq("destaque", true)
    .eq("publicado", true);

  query = aplicarFiltros(query, filtros);

  const { data, error } = await aplicarOrdenacao(query, filtros?.ordenarPor);

  if (error) {
    console.error("Erro ao buscar imóveis em destaque:", error.message);
    return [];
  }

  return (data ?? []).map((row: any) => mapRowParaImovel(row, supabase));
}

// Todos os imóveis publicados e disponíveis (sem filtrar por destaque),
// usados nas seções "Imóveis para aluguel" e "Imóveis para venda" da Home.
export async function getImoveisPublicados(
  filtros?: FiltrosImoveis
): Promise<Imovel[]> {
  const supabase = createSupabaseServerClient();

  let query = supabase
    .from("imoveis")
    .select("*, imovel_fotos(url, ordem)")
    .eq("status", "disponivel")
    .eq("publicado", true);

  query = aplicarFiltros(query, filtros);

  const { data, error } = await aplicarOrdenacao(query, filtros?.ordenarPor);

  if (error) {
    console.error("Erro ao buscar imóveis publicados:", error.message);
    return [];
  }

  return (data ?? []).map((row: any) => mapRowParaImovel(row, supabase));
}

// Categorias (tipo) realmente em uso entre os imóveis publicados —
// alimenta o seletor "Categoria" do formulário de filtros da Home.
// Deduplicada ignorando maiúsculas/minúsculas e espaços (ex.: "Apartamento" e
// "apartamento" cadastrados com grafias diferentes viram uma única opção),
// mesma normalização já aplicada a cidade/bairro logo abaixo.
export async function getCategoriasDisponiveis(): Promise<OpcaoLocalidade[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("imoveis")
    .select("tipo")
    .eq("status", "disponivel")
    .eq("publicado", true);

  if (error) {
    console.error("Erro ao buscar categorias disponíveis:", error.message);
    return [];
  }

  const mapa = new Map<string, OpcaoLocalidade>();

  for (const linha of data ?? []) {
    if (!linha.tipo) continue;
    const chave = chaveNormalizada(linha.tipo);
    if (!mapa.has(chave)) {
      mapa.set(chave, { valor: chave, rotulo: capitalizarPalavras(linha.tipo) });
    }
  }

  return Array.from(mapa.values()).sort((a, b) =>
    a.rotulo.localeCompare(b.rotulo, "pt-BR")
  );
}

export interface OpcaoLocalidade {
  valor: string; // normalizado (minúsculo, sem espaços extras) — usado no filtro/URL
  rotulo: string; // exibido no select
}

export interface OpcaoBairro extends OpcaoLocalidade {
  cidade: string; // valor normalizado da cidade a que este bairro pertence
}

// Lista única de cidades entre os imóveis publicados, sem duplicidade
// (ignorando maiúsculas/minúsculas e espaços), ordenada alfabeticamente.
export async function getCidadesDisponiveis(): Promise<OpcaoLocalidade[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("imoveis")
    .select("cidade")
    .eq("status", "disponivel")
    .eq("publicado", true);

  if (error) {
    console.error("Erro ao buscar cidades disponíveis:", error.message);
    return [];
  }

  const mapa = new Map<string, OpcaoLocalidade>();

  for (const linha of data ?? []) {
    if (!linha.cidade) continue;
    const chave = chaveNormalizada(linha.cidade);
    if (!mapa.has(chave)) {
      mapa.set(chave, { valor: chave, rotulo: capitalizarPalavras(linha.cidade) });
    }
  }

  return Array.from(mapa.values()).sort((a, b) =>
    a.rotulo.localeCompare(b.rotulo, "pt-BR")
  );
}

// Lista única de bairros entre os imóveis publicados, cada um já associado
// à sua cidade (normalizada), para o formulário filtrar os bairros
// automaticamente ao trocar a cidade selecionada.
export async function getBairrosDisponiveis(): Promise<OpcaoBairro[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("imoveis")
    .select("cidade, bairro")
    .eq("status", "disponivel")
    .eq("publicado", true);

  if (error) {
    console.error("Erro ao buscar bairros disponíveis:", error.message);
    return [];
  }

  const mapa = new Map<string, OpcaoBairro>();

  for (const linha of data ?? []) {
    if (!linha.cidade || !linha.bairro) continue;
    const chaveCidade = chaveNormalizada(linha.cidade);
    const chaveBairro = chaveNormalizada(linha.bairro);
    const chave = `${chaveCidade}|${chaveBairro}`;

    if (!mapa.has(chave)) {
      mapa.set(chave, {
        cidade: chaveCidade,
        valor: chaveBairro,
        rotulo: capitalizarPalavras(linha.bairro),
      });
    }
  }

  return Array.from(mapa.values()).sort((a, b) =>
    a.rotulo.localeCompare(b.rotulo, "pt-BR")
  );
}

// Imóvel individual pelo slug, para a página /imovel/[slug].
// Só retorna imóveis publicados — um imóvel não publicado não deve ficar
// acessível no site público, mesmo sabendo a URL exata.
export async function getImovelPorSlug(slug: string): Promise<Imovel | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("imoveis")
    .select("*, imovel_fotos(url, ordem)")
    .eq("slug", slug)
    .eq("publicado", true)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar imóvel pelo slug:", error.message);
    return null;
  }

  return data ? mapRowParaImovel(data, supabase) : null;
}

// URLs públicas das fotos de um imóvel, na ordem definida em
// `imovel_fotos.ordem` — converte o caminho salvo no banco em URL do Storage.
export async function getFotosDoImovel(imovelId: string): Promise<string[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("imovel_fotos")
    .select("url")
    .eq("imovel_id", imovelId)
    .order("ordem", { ascending: true });

  if (error) {
    console.error("Erro ao buscar fotos do imóvel:", error.message);
    return [];
  }

  return (data ?? []).map((foto) => obterUrlPublicaFoto(supabase, foto.url));
}
