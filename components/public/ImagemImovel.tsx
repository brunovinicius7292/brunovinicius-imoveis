"use client";

import { useState } from "react";
import Image from "next/image";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Só as fotos reais dos imóveis (Supabase Storage) passam pelo next/image —
// thumbnails do YouTube e o placeholder picsum.photos continuam como <img>
// normal, para não precisar liberar esses domínios em images.remotePatterns.
function ehFotoDoSupabase(src: string) {
  return Boolean(SUPABASE_URL) && src.startsWith(SUPABASE_URL as string);
}

export default function ImagemImovel({
  src,
  srcFallback,
  alt,
  className,
  sizes,
}: {
  src: string;
  srcFallback?: string | null;
  alt: string;
  className?: string;
  // Dica de tamanho renderizado para o next/image escolher a versão certa do
  // arquivo — ajuste no chamador se o card for exibido num contexto bem
  // diferente do padrão (grade de listagem/carrossel de imóveis).
  sizes?: string;
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

  if (ehFotoDoSupabase(srcAtual)) {
    return (
      <Image
        src={srcAtual}
        onError={usarFallbackSeNecessario}
        alt={alt}
        className={className}
        // Dimensões apenas para o cálculo de proporção do next/image — o
        // tamanho exibido em tela continua definido pelas classes Tailwind
        // (h-*/w-*) recebidas em `className`, exatamente como no <img> antigo.
        width={400}
        height={300}
        sizes={sizes ?? "(min-width: 640px) 340px, 100vw"}
        loading="lazy"
      />
    );
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
