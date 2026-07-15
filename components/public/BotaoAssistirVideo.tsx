"use client";

import { useEffect, useState } from "react";

// Botão que fica sobre a thumbnail do YouTube (quando o imóvel não tem
// fotos) e abre o vídeo em um modal na própria página, em vez de redirecionar
// para o YouTube. O iframe só existe no DOM enquanto o modal está aberto —
// fechar o modal desmonta o iframe e o vídeo para automaticamente.
export default function BotaoAssistirVideo({
  urlEmbed,
  titulo,
}: {
  urlEmbed: string;
  titulo: string;
}) {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!aberto) return;

    function handleKeyDown(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [aberto]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="absolute inset-0 flex items-center justify-center bg-navy-900/30 transition hover:bg-navy-900/40"
      >
        <span className="flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 font-body text-sm font-semibold text-navy-900 shadow-lg">
          ▶ Assistir vídeo
        </span>
      </button>

      {aberto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Vídeo do imóvel ${titulo}`}
          onClick={() => setAberto(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          <button
            type="button"
            onClick={() => setAberto(false)}
            aria-label="Fechar"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            onClick={(evento) => evento.stopPropagation()}
            className="aspect-video w-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl"
          >
            <iframe
              src={`${urlEmbed}${urlEmbed.includes("?") ? "&" : "?"}autoplay=1`}
              title={`Vídeo do imóvel ${titulo}`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
