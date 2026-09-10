import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import ImovelCard from "@/components/public/ImovelCard";
import { getSelecaoCompartilhada } from "@/lib/supabase/selecoes";
import { getImoveisPorIds } from "@/lib/supabase/imoveis";
import { obterThumbnailYoutube } from "@/lib/utils/youtube";
import { obterImagemPadraoSite, obterUrlSite } from "@/lib/utils/site";
import { Imovel } from "@/lib/types/imovel";

// null = código inexistente/inválido (página deve virar 404).
// [] = código existe, mas nenhum imóvel da lista está mais disponível
// (removido/despublicado depois de compartilhado) — não é erro, é estado
// vazio tratado na própria página.
async function buscarImoveisDaSelecao(codigo: string): Promise<Imovel[] | null> {
  const selecao = await getSelecaoCompartilhada(codigo);
  if (!selecao) return null;

  return getImoveisPorIds(selecao.imovelIds);
}

export async function generateMetadata({
  params,
}: {
  params: { codigo: string };
}): Promise<Metadata> {
  const imoveis = await buscarImoveisDaSelecao(params.codigo);

  if (!imoveis) {
    return {};
  }

  const titulo = "Imóveis selecionados para você | Bruno Vinícius Imóveis";
  const descricao =
    imoveis.length > 0
      ? `${imoveis.length} ${
          imoveis.length === 1 ? "imóvel separado" : "imóveis separados"
        } especialmente para você.`
      : "Seleção de imóveis compartilhada.";
  const url = `${obterUrlSite()}/selecao/${params.codigo}`;

  // Mesma prioridade de mídia já usada na página de detalhe do imóvel (foto
  // de capa > thumbnail do vídeo > imagem padrão do site), aplicada ao
  // primeiro imóvel da seleção — é o que representa a seleção como um todo.
  const primeiro = imoveis[0];
  const thumbnailVideo = primeiro
    ? obterThumbnailYoutube(primeiro.videoYoutubeUrl, "hqdefault")
    : null;

  const imagem = primeiro?.fotoCapaUrl
    ? { url: primeiro.fotoCapaUrl, width: 1200, height: 630 }
    : thumbnailVideo
      ? { url: thumbnailVideo, width: 480, height: 360 }
      : obterImagemPadraoSite();

  return {
    title: titulo,
    description: descricao,
    openGraph: {
      title: titulo,
      description: descricao,
      url,
      type: "website",
      locale: "pt_BR",
      images: [imagem],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descricao,
      images: [imagem.url],
    },
  };
}

export default async function PaginaSelecaoCompartilhada({
  params,
}: {
  params: { codigo: string };
}) {
  const imoveis = await buscarImoveisDaSelecao(params.codigo);

  if (!imoveis) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-display text-3xl font-semibold text-navy-900 sm:text-4xl">
          Imóveis selecionados para você
        </h1>
        <p className="mt-2 font-body text-navy-400">
          {imoveis.length > 0
            ? "Separamos estes imóveis especialmente para você."
            : "Os imóveis desta seleção não estão mais disponíveis."}
        </p>

        {imoveis.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {imoveis.map((imovel) => (
              <ImovelCard key={imovel.id} imovel={imovel} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
            <p className="font-body text-sm text-navy-400">
              Os imóveis desta seleção não estão mais disponíveis. Fale com a
              gente para receber novas opções.
            </p>
          </div>
        )}
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </main>
  );
}
