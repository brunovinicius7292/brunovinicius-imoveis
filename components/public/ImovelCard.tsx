import Link from "next/link";
import { Imovel } from "@/lib/types/imovel";
import { extrairIdYoutube, obterThumbnailYoutube } from "@/lib/utils/youtube";
import ImagemImovel from "@/components/public/ImagemImovel";
import PreviaVideoImovel from "@/components/public/PreviaVideoImovel";
import { formatarMoeda } from "@/lib/utils/preco";

function formatarPreco(imovel: Imovel) {
  const valor = formatarMoeda(imovel.preco);
  return imovel.finalidade === "aluguel" ? `${valor}/mês` : valor;
}

const BADGES_FINALIDADE: Record<string, string> = {
  venda: "🟢 Venda",
  aluguel: "🔵 Aluguel",
  venda_aluguel: "🟣 Venda e Aluguel",
};

// Imagem de exemplo temporária (fallback), usada só enquanto o imóvel ainda
// não tem nenhuma foto real enviada pelo painel administrativo.
function fotoExemploUrl(imovel: Imovel) {
  return `https://picsum.photos/seed/${imovel.slug || imovel.id}/640/480`;
}

function IconeQuartos() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5V19h18v-8.5M3 10.5 12 4l9 6.5M3 10.5h18M7 14h3v3H7v-3Z" />
    </svg>
  );
}

function IconeBanheiros() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12V6a2 2 0 0 1 3.2-1.6M4 19v1.5M18 19v1.5" />
    </svg>
  );
}

function IconeVagas() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16.5 5.6 11a2 2 0 0 1 1.9-1.4h9a2 2 0 0 1 1.9 1.4L20 16.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16.5h16v2.25a.75.75 0 0 1-.75.75H4.75a.75.75 0 0 1-.75-.75V16.5Z" />
      <circle cx="7.5" cy="16.5" r="1.1" />
      <circle cx="16.5" cy="16.5" r="1.1" />
    </svg>
  );
}

function IconeArea() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h5M4 4v5M20 4h-5M20 4v5M4 20h5M4 20v-5M20 20h-5M20 20v-5" />
    </svg>
  );
}

export default function ImovelCard({
  imovel,
  contexto,
}: {
  imovel: Imovel;
  // Em qual seção o card está sendo exibido ("venda" ou "aluguel"). Só
  // importa para imóveis "venda_aluguel": define qual dos dois valores
  // mostrar. Sem contexto (ex.: destaques), mostra os dois valores.
  contexto?: "venda" | "aluguel";
}) {
  const temFotoReal = Boolean(imovel.fotoCapaUrl);
  const thumbnailVideo = temFotoReal
    ? null
    : obterThumbnailYoutube(imovel.videoYoutubeUrl);
  const thumbnailVideoFallback = temFotoReal
    ? null
    : obterThumbnailYoutube(imovel.videoYoutubeUrl, "hqdefault");
  const usandoThumbnailVideo = Boolean(thumbnailVideo);
  const idVideoYoutube = usandoThumbnailVideo
    ? extrairIdYoutube(imovel.videoYoutubeUrl ?? "")
    : null;

  const imagemPrincipal =
    imovel.fotoCapaUrl || thumbnailVideo || fotoExemploUrl(imovel);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative overflow-hidden">
        {idVideoYoutube ? (
          <PreviaVideoImovel
            videoId={idVideoYoutube}
            posterUrl={imagemPrincipal}
            posterFallbackUrl={thumbnailVideoFallback}
            alt={imovel.titulo}
            className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <ImagemImovel
            src={imagemPrincipal}
            srcFallback={usandoThumbnailVideo ? thumbnailVideoFallback : null}
            alt={imovel.titulo}
            className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900/40 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-navy-900/90 px-3 py-1 font-body text-xs font-medium uppercase tracking-wide text-gold-300 shadow-sm">
          {BADGES_FINALIDADE[imovel.finalidade] ?? imovel.finalidade}
        </span>
        {usandoThumbnailVideo && (
          <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-navy-900/80 px-3 py-1.5 font-body text-[11px] font-semibold uppercase tracking-wider text-gold-200 shadow-md ring-1 ring-white/10 backdrop-blur-sm">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
              <path d="M8 5v14l11-7Z" />
            </svg>
            Vídeo
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {imovel.finalidade === "venda_aluguel" && contexto === "venda" ? (
          <p className="font-display text-2xl font-semibold text-gold-600">
            {formatarMoeda(imovel.preco)}
          </p>
        ) : imovel.finalidade === "venda_aluguel" && contexto === "aluguel" ? (
          <p className="font-display text-2xl font-semibold text-gold-600">
            {formatarMoeda(imovel.precoAluguel ?? 0)}/mês
          </p>
        ) : imovel.finalidade === "venda_aluguel" ? (
          <div className="flex flex-col gap-0.5">
            <p className="font-display text-xl font-semibold text-gold-600">
              Venda: {formatarMoeda(imovel.preco)}
            </p>
            <p className="font-body text-sm font-semibold text-navy-500">
              Aluguel: {formatarMoeda(imovel.precoAluguel ?? 0)}/mês
            </p>
          </div>
        ) : (
          <p className="font-display text-2xl font-semibold text-gold-600">
            {formatarPreco(imovel)}
          </p>
        )}

        <div>
          <h3 className="font-body text-base font-semibold text-navy-800">
            {imovel.titulo}
          </h3>
          <p className="mt-0.5 font-body text-sm text-navy-400">
            {imovel.tipo} · {imovel.bairro}, {imovel.cidade}
          </p>
        </div>

        <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1.5 font-body text-sm text-navy-500">
          <li className="flex items-center gap-1.5">
            <IconeQuartos />
            {imovel.quartos} qts
          </li>
          <li className="flex items-center gap-1.5">
            <IconeBanheiros />
            {imovel.banheiros} banh.
          </li>
          <li className="flex items-center gap-1.5">
            <IconeVagas />
            {imovel.vagas} vagas
          </li>
          <li className="flex items-center gap-1.5">
            <IconeArea />
            {imovel.areaM2} m²
          </li>
        </ul>

        <Link
          href={`/imovel/${imovel.slug}`}
          className="mt-auto block w-full rounded-xl border border-navy-800 py-2.5 text-center font-body text-sm font-semibold text-navy-800 transition group-hover:bg-navy-800 group-hover:text-white"
        >
          Ver imóvel
        </Link>
      </div>
    </article>
  );
}
