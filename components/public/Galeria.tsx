"use client";

import { useEffect, useState } from "react";
import FotoPlaceholder from "@/components/ui/FotoPlaceholder";

export default function Galeria({
  titulo,
  fotos,
}: {
  titulo: string;
  fotos: string[];
}) {
  const [ativa, setAtiva] = useState(0);
  const [lightboxAberto, setLightboxAberto] = useState(false);

  function irParaAnterior() {
    setAtiva((atual) => (atual - 1 + fotos.length) % fotos.length);
  }

  function irParaProxima() {
    setAtiva((atual) => (atual + 1) % fotos.length);
  }

  useEffect(() => {
    if (!lightboxAberto) return;

    function handleKeyDown(evento: KeyboardEvent) {
      if (evento.key === "Escape") setLightboxAberto(false);
      if (evento.key === "ArrowLeft") irParaAnterior();
      if (evento.key === "ArrowRight") irParaProxima();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxAberto, fotos.length]);

  if (fotos.length === 0) {
    return <FotoPlaceholder className="h-72 w-full rounded-2xl sm:h-96" />;
  }

  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fotos[ativa]}
        alt={`${titulo} — foto ${ativa + 1}`}
        onClick={() => setLightboxAberto(true)}
        className="h-72 w-full cursor-zoom-in rounded-2xl object-cover sm:h-96"
      />

      {fotos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {fotos.map((foto, indice) => (
            <button
              key={foto}
              type="button"
              onClick={() => {
                setAtiva(indice);
                setLightboxAberto(true);
              }}
              aria-label={`Ver foto ${indice + 1} de ${titulo}`}
              aria-pressed={ativa === indice}
              className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                ativa === indice
                  ? "ring-gold-400"
                  : "ring-transparent opacity-80 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxAberto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${titulo} — visualização em tela cheia`}
          onClick={() => setLightboxAberto(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          <button
            type="button"
            onClick={() => setLightboxAberto(false)}
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

          {fotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(evento) => {
                  evento.stopPropagation();
                  irParaAnterior();
                }}
                aria-label="Foto anterior"
                className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-4"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="h-6 w-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(evento) => {
                  evento.stopPropagation();
                  irParaProxima();
                }}
                aria-label="Próxima foto"
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-4"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="h-6 w-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotos[ativa]}
            alt={`${titulo} — foto ${ativa + 1} em tela cheia`}
            onClick={(evento) => evento.stopPropagation()}
            className="max-h-full max-w-full rounded-lg object-contain"
          />

          {fotos.length > 1 && (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 font-body text-xs text-white">
              {ativa + 1} / {fotos.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
