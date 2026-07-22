import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import Galeria from "@/components/public/Galeria";
import FotoPlaceholder from "@/components/ui/FotoPlaceholder";
import BotaoWhatsApp from "@/components/public/BotaoWhatsApp";
import BotaoCompartilhar from "@/components/public/BotaoCompartilhar";
import BotaoVoltar from "@/components/public/BotaoVoltar";
import { getImovelPorSlug, getFotosDoImovel } from "@/lib/supabase/imoveis";
import { obterUrlEmbedYoutube, obterThumbnailYoutube } from "@/lib/utils/youtube";
import DescricaoImovel from "@/components/public/DescricaoImovel";
import ImagemImovel from "@/components/public/ImagemImovel";
import BotaoAssistirVideo from "@/components/public/BotaoAssistirVideo";
import { Imovel } from "@/lib/types/imovel";
import { formatarMoeda, ROTULOS_FINALIDADE } from "@/lib/utils/preco";
import { obterUrlImovel, obterUrlSite } from "@/lib/utils/site";

function formatarPreco(imovel: Imovel) {
  const valor = formatarMoeda(imovel.preco);
  return imovel.finalidade === "aluguel" ? `${valor}/mês` : valor;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const imovel = await getImovelPorSlug(params.slug);

  if (!imovel) {
    return {};
  }

  const url = obterUrlImovel(imovel.slug);
  const descricao = `${imovel.bairro}, ${imovel.cidade} · ${formatarPreco(imovel)}`;
  const imagem = imovel.fotoCapaUrl || `${obterUrlSite()}/image.png`;

  return {
    title: imovel.titulo,
    description: descricao,
    openGraph: {
      title: imovel.titulo,
      description: descricao,
      url,
      type: "website",
      locale: "pt_BR",
      images: [{ url: imagem, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: imovel.titulo,
      description: descricao,
      images: [imagem],
    },
  };
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
  const thumbnailVideo = obterThumbnailYoutube(imovel.videoYoutubeUrl);
  const thumbnailVideoFallback = obterThumbnailYoutube(
    imovel.videoYoutubeUrl,
    "hqdefault"
  );

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <BotaoVoltar />

        <div className="mt-4">
          {fotos.length > 0 ? (
            <Galeria titulo={imovel.titulo} fotos={fotos} />
          ) : thumbnailVideo ? (
            <div className="relative h-72 w-full overflow-hidden rounded-2xl sm:h-96">
              <ImagemImovel
                src={thumbnailVideo}
                srcFallback={thumbnailVideoFallback}
                alt={`Vídeo do imóvel ${imovel.titulo}`}
                className="h-full w-full object-cover"
              />
              <BotaoAssistirVideo
                urlEmbed={urlEmbedVideo ?? ""}
                titulo={imovel.titulo}
              />
            </div>
          ) : (
            <FotoPlaceholder className="h-72 w-full rounded-2xl sm:h-96" />
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <span className="inline-block rounded-full bg-navy-900 px-3 py-1 font-body text-xs font-medium uppercase tracking-wide text-gold-300">
              {ROTULOS_FINALIDADE[imovel.finalidade] ?? imovel.finalidade}
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

            {fotos.length > 0 && urlEmbedVideo && thumbnailVideo && (
              <div className="mt-6">
                <h2 className="font-display text-xl font-semibold text-navy-900">
                  Vídeo
                </h2>
                <div className="relative mt-2 aspect-video overflow-hidden rounded-2xl">
                  <ImagemImovel
                    src={thumbnailVideo}
                    srcFallback={thumbnailVideoFallback}
                    alt={`Vídeo do imóvel ${imovel.titulo}`}
                    className="h-full w-full object-cover"
                  />
                  <BotaoAssistirVideo
                    urlEmbed={urlEmbedVideo}
                    titulo={imovel.titulo}
                  />
                </div>
              </div>
            )}
          </div>

          <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-900/5 lg:sticky lg:top-6">
            {imovel.finalidade === "venda_aluguel" ? (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wide text-navy-400">
                    Venda
                  </p>
                  <p className="font-display text-2xl font-semibold text-gold-600">
                    {formatarMoeda(imovel.preco)}
                  </p>
                </div>
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wide text-navy-400">
                    Aluguel
                  </p>
                  <p className="font-display text-2xl font-semibold text-gold-600">
                    {formatarMoeda(imovel.precoAluguel ?? 0)}/mês
                  </p>
                </div>
              </div>
            ) : (
              <p className="font-display text-3xl font-semibold text-gold-600">
                {formatarPreco(imovel)}
              </p>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <BotaoWhatsApp titulo={imovel.titulo} slug={imovel.slug} />
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
