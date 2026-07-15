"use client";

import { useEffect, useRef, useState } from "react";
import { Imovel } from "@/lib/types/imovel";
import ImovelCard from "@/components/public/ImovelCard";

function IconeSetaEsquerda() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-5 w-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function IconeSetaDireita() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-5 w-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function FeaturedSection({ imoveis }: { imoveis: Imovel[] }) {
  const trilhaRef = useRef<HTMLDivElement>(null);
  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(false);

  function atualizarSetas() {
    const trilha = trilhaRef.current;
    if (!trilha) return;
    setPodeVoltar(trilha.scrollLeft > 8);
    setPodeAvancar(
      trilha.scrollLeft + trilha.clientWidth < trilha.scrollWidth - 8
    );
  }

  useEffect(() => {
    atualizarSetas();
    window.addEventListener("resize", atualizarSetas);
    return () => window.removeEventListener("resize", atualizarSetas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imoveis]);

  function rolar(direcao: 1 | -1) {
    const trilha = trilhaRef.current;
    if (!trilha) return;
    trilha.scrollBy({ left: trilha.clientWidth * 0.85 * direcao, behavior: "smooth" });
  }

  if (imoveis.length === 0) return null;

  return (
    <section id="destaques" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="font-body text-sm font-medium uppercase tracking-[0.2em] text-gold-600">
            Seleção do corretor
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-navy-900">
            Imóveis em destaque
          </h2>
        </div>

        <div className="hidden shrink-0 gap-2 sm:flex">
          <button
            type="button"
            aria-label="Ver destaques anteriores"
            onClick={() => rolar(-1)}
            disabled={!podeVoltar}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-200 text-navy-600 transition hover:border-navy-800 hover:text-navy-900 disabled:pointer-events-none disabled:opacity-30"
          >
            <IconeSetaEsquerda />
          </button>
          <button
            type="button"
            aria-label="Ver mais destaques"
            onClick={() => rolar(1)}
            disabled={!podeAvancar}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-200 text-navy-600 transition hover:border-navy-800 hover:text-navy-900 disabled:pointer-events-none disabled:opacity-30"
          >
            <IconeSetaDireita />
          </button>
        </div>
      </div>

      <div
        ref={trilhaRef}
        onScroll={atualizarSetas}
        className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-2 sm:mx-0 sm:gap-6 sm:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {imoveis.map((imovel) => (
          <div
            key={imovel.id}
            className="w-[78%] flex-none snap-start sm:w-[340px]"
          >
            <ImovelCard imovel={imovel} />
          </div>
        ))}
      </div>
    </section>
  );
}
