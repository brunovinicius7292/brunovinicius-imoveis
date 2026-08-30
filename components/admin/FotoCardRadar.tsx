"use client";

import { useState } from "react";
import Image from "next/image";
import FotoPlaceholder from "@/components/ui/FotoPlaceholder";
import { obterThumbnailYoutube } from "@/lib/utils/youtube";

// Miniatura usada nos cards do Radar de compatibilidade (Imóveis
// compatíveis / Clientes compatíveis): foto de capa real, senão a thumbnail
// do vídeo do YouTube, senão o placeholder — mesma prioridade usada nos
// cards do site público (components/public/ImovelCard.tsx), mas com
// next/image em tamanho pequeno (thumbnail) e lazy loading em vez da <img>
// em resolução cheia usada lá.
export default function FotoCardRadar({
  fotoCapaUrl,
  videoYoutubeUrl,
  alt,
}: {
  fotoCapaUrl?: string;
  videoYoutubeUrl?: string;
  alt: string;
}) {
  const temFotoReal = Boolean(fotoCapaUrl);
  const thumbnailMax = temFotoReal
    ? null
    : obterThumbnailYoutube(videoYoutubeUrl);
  const thumbnailFallback = temFotoReal
    ? null
    : obterThumbnailYoutube(videoYoutubeUrl, "hqdefault");

  const [src, setSrc] = useState<string | null>(fotoCapaUrl || thumbnailMax || null);

  function usarFallbackOuPlaceholder() {
    if (thumbnailFallback && src !== thumbnailFallback) {
      setSrc(thumbnailFallback);
    } else {
      setSrc(null);
    }
  }

  function handleLoad(evento: React.SyntheticEvent<HTMLImageElement>) {
    // O YouTube responde com uma imagem "placeholder" de 120x90 quando a
    // thumbnail em alta resolução (maxresdefault) não existe para o vídeo.
    const img = evento.currentTarget;
    if (img.naturalWidth === 120 && img.naturalHeight === 90) {
      usarFallbackOuPlaceholder();
    }
  }

  if (!src) {
    return <FotoPlaceholder className="h-16 w-16 shrink-0 rounded-lg" />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={64}
      height={64}
      loading="lazy"
      onLoad={handleLoad}
      onError={usarFallbackOuPlaceholder}
      className="h-16 w-16 shrink-0 rounded-lg object-cover"
    />
  );
}
