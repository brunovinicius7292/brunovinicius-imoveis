"use client";

import { useState } from "react";

export default function ImagemImovel({
  src,
  srcFallback,
  alt,
  className,
}: {
  src: string;
  srcFallback?: string | null;
  alt: string;
  className?: string;
}) {
  const [srcAtual, setSrcAtual] = useState(src);

  function usarFallbackSeNecessario() {
    if (srcFallback && srcAtual !== srcFallback) {
      setSrcAtual(srcFallback);
    }
  }

  function handleLoad(evento: React.SyntheticEvent<HTMLImageElement>) {
    const img = evento.currentTarget;
    // O YouTube responde com uma imagem "placeholder" de 120x90 quando a
    // thumbnail em alta resolução (maxresdefault) não existe para o vídeo.
    if (img.naturalWidth === 120 && img.naturalHeight === 90) {
      usarFallbackSeNecessario();
    }
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={srcAtual}
      onLoad={handleLoad}
      onError={usarFallbackSeNecessario}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
}
