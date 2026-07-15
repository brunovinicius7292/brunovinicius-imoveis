import Link from "next/link";
import { Imovel } from "@/lib/types/imovel";
import { obterThumbnailYoutube } from "@/lib/utils/youtube";
import ImagemImovel from "@/components/public/ImagemImovel";

function formatarPreco(imovel: Imovel) {
  const valor = imovel.preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
  return imovel.finalidade === "aluguel" ? `${valor}/mês` : valor;
}

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

export default function ImovelCard({ imovel }: { imovel: Imovel }) {
  const temFotoReal = Boolean(imovel.fotoCapaUrl);
  const thumbnailVideo = temFotoReal
    ? null
    : obterThumbnailYoutube(imovel.videoYoutubeUrl);
  const thumbnailVideoFallback = temFotoReal
    ? null
    : obterThumbnailYoutube(imovel.videoYoutubeUrl, "hqdefault");
  const usandoThumbnailVideo = Boolean(thumbnailVideo);

  const imagemPrincipal =
    imovel.fotoCapaUrl || thumbnailVideo || fotoExemploUrl(imovel);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative overflow-hidden">
        <ImagemImovel
          src={imagemPrincipal}
          srcFallback={usandoThumbnailVideo ? thumbnailVideoFallback : null}
          alt={imovel.titulo}
          className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900/40 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-navy-900/90 px-3 py-1 font-body text-xs font-medium uppercase tracking-wide text-gold-300 shadow-sm">
          {imovel.finalidade === "venda" ? "Venda" : "Aluguel"}
        </span>
        {usandoThumbnailVideo && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-navy-900/75 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white shadow-sm backdrop-blur-sm">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5 text-gold-300">
              <path d="M8 5v14l11-7Z" />
            </svg>
            Vídeo
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="font-display text-2xl font-semibold text-gold-600">
          {formatarPreco(imovel)}
        </p>

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
