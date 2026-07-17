"use client";

import { useEffect, useRef, useState } from "react";
import ImagemImovel from "@/components/public/ImagemImovel";

// Prévia do vídeo do YouTube usada nos cards de listagem: toca
// automaticamente (mudo, em loop) só enquanto o card está visível na tela, e
// volta a mostrar a thumbnail assim que ele sai da área visível — evita
// vários vídeos autoplayando ao mesmo tempo e economiza dados em quem está
// rolando a página rápido.
export default function PreviaVideoImovel({
  videoId,
  posterUrl,
  posterFallbackUrl,
  alt,
  className,
}: {
  videoId: string;
  posterUrl: string;
  posterFallbackUrl?: string | null;
  alt: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);
  // Autoplay é exclusivo de dispositivos touch (celular/tablet). No
  // computador, com mouse/hover disponível, a informação/movimento de vários
  // vídeos tocando lado a lado ficava carregada demais — lá o card volta a
  // mostrar só a foto estática, como antes dessa funcionalidade existir.
  const [ehTouch, setEhTouch] = useState(false);

  useEffect(() => {
    setEhTouch(window.matchMedia("(hover: none) and (pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    if (!ehTouch) return;

    const elemento = containerRef.current;
    if (!elemento) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisivel(entry.isIntersecting),
      { threshold: 0.5 }
    );
    observer.observe(elemento);
    return () => observer.disconnect();
  }, [ehTouch]);

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <ImagemImovel
        src={posterUrl}
        srcFallback={posterFallbackUrl}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {ehTouch && visivel && (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&playsinline=1&rel=0`}
          title={alt}
          className="pointer-events-none absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media"
        />
      )}
    </div>
  );
}
