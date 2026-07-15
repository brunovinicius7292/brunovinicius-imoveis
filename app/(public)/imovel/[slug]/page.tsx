import { notFound } from "next/navigation";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import Galeria from "@/components/public/Galeria";
import FotoPlaceholder from "@/components/ui/FotoPlaceholder";
import BotaoWhatsApp from "@/components/public/BotaoWhatsApp";
import BotaoCompartilhar from "@/components/public/BotaoCompartilhar";
import BotaoVoltar from "@/components/public/BotaoVoltar";
import { getImovelPorSlug, getFotosDoImovel } from "@/lib/supabase/imoveis";
import { obterUrlEmbedYoutube } from "@/lib/utils/youtube";
import DescricaoImovel from "@/components/public/DescricaoImovel";
import { Imovel } from "@/lib/types/imovel";

function formatarPreco(imovel: Imovel) {
  const valor = imovel.preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
  return imovel.finalidade === "aluguel" ? `${valor}/mês` : valor;
}

export default async function PaginaImovel({
  params,
}: {
  params: { slug: string };
}) {
  const imovel = await getImovelPorSlug(params.slug);

  if (!imovel) {
    notFound();
  }

  const fotos = await getFotosDoImovel(imovel.id);
  const urlEmbedVideo = obterUrlEmbedYoutube(imovel.videoYoutubeUrl);

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <BotaoVoltar />

        <div className="mt-4">
          {fotos.length > 0 ? (
            <Galeria titulo={imovel.titulo} fotos={fotos} />
          ) : urlEmbedVideo ? (
            <div className="h-72 w-full overflow-hidden rounded-2xl sm:h-96">
              <iframe
                src={urlEmbedVideo}
                title={`Vídeo do imóvel ${imovel.titulo}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <FotoPlaceholder className="h-72 w-full rounded-2xl sm:h-96" />
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <span className="inline-block rounded-full bg-navy-900 px-3 py-1 font-body text-xs font-medium uppercase tracking-wide text-gold-300">
              {imovel.finalidade === "venda" ? "Venda" : "Aluguel"}
            </span>

            <h1 className="mt-3 font-display text-3xl font-semibold text-navy-900 sm:text-4xl">
              {imovel.titulo}
            </h1>
            <p className="mt-1 font-body text-navy-400">
              {imovel.tipo} · {imovel.bairro}, {imovel.cidade}
              {imovel.codigo && ` · Código ${imovel.codigo}`}
            </p>

            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3 rounded-2xl bg-white p-5 font-body text-sm text-navy-600 shadow-sm ring-1 ring-navy-900/5">
              <li>
                <span className="block font-semibold text-navy-900">
                  {imovel.quartos}
                </span>
                Quartos
              </li>
              <li>
                <span className="block font-semibold text-navy-900">
                  {imovel.banheiros}
                </span>
                Banheiros
              </li>
              <li>
                <span className="block font-semibold text-navy-900">
                  {imovel.vagas}
                </span>
                Vagas
              </li>
              <li>
                <span className="block font-semibold text-navy-900">
                  {imovel.areaM2} m²
                </span>
                Área
              </li>
            </ul>

            {imovel.descricao && (
              <div className="mt-6">
                <h2 className="font-display text-xl font-semibold text-navy-900">
                  Sobre o imóvel
                </h2>
                <DescricaoImovel texto={imovel.descricao} />
              </div>
            )}

            {fotos.length > 0 && urlEmbedVideo && (
              <div className="mt-6">
                <h2 className="font-display text-xl font-semibold text-navy-900">
                  Vídeo
                </h2>
                <div className="mt-2 aspect-video overflow-hidden rounded-2xl">
                  <iframe
                    src={urlEmbedVideo}
                    title={`Vídeo do imóvel ${imovel.titulo}`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-900/5 lg:sticky lg:top-6">
            <p className="font-display text-3xl font-semibold text-gold-600">
              {formatarPreco(imovel)}
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <BotaoWhatsApp titulo={imovel.titulo} />
              <BotaoCompartilhar titulo={imovel.titulo} />
            </div>
          </aside>
        </div>
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </main>
  );
}
