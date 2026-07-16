"use client";

import { useEffect, useRef, useState } from "react";
import FormularioFiltros from "@/components/public/FormularioFiltros";
import { OpcaoBairro, OpcaoLocalidade } from "@/lib/supabase/imoveis";

// Envolve o FormularioFiltros para que ele continue no lugar normal (dentro
// do Hero) e, assim que essa posição rolar para fora da tela, uma versão
// compacta do mesmo formulário passe a flutuar fixa no topo da janela.
// A instância original fica "invisible" (mantém o espaço, some visualmente)
// enquanto a versão fixa assume — evitando qualquer salto de layout.
// Esse comportamento é exclusivo do desktop (>= lg); no mobile o formulário
// aparece uma única vez, na posição normal, e o IntersectionObserver nem
// chega a ser criado.
export default function FiltrosSticky({
  categorias,
  cidades,
  bairros,
}: {
  categorias: string[];
  cidades: OpcaoLocalidade[];
  bairros: OpcaoBairro[];
}) {
  const sentinelaRef = useRef<HTMLDivElement>(null);
  const [fixo, setFixo] = useState(false);

  useEffect(() => {
    const sentinela = sentinelaRef.current;
    if (!sentinela) return;

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    let observer: IntersectionObserver | null = null;

    const sincronizarObserver = () => {
      if (mediaQuery.matches) {
        observer = new IntersectionObserver(([entrada]) =>
          setFixo(!entrada.isIntersecting)
        );
        observer.observe(sentinela);
      } else {
        observer?.disconnect();
        observer = null;
        setFixo(false);
      }
    };

    sincronizarObserver();
    mediaQuery.addEventListener("change", sincronizarObserver);

    return () => {
      mediaQuery.removeEventListener("change", sincronizarObserver);
      observer?.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={sentinelaRef} aria-hidden="true" />

      <div className={fixo ? "lg:invisible" : ""}>
        <FormularioFiltros
          categorias={categorias}
          cidades={cidades}
          bairros={bairros}
        />
      </div>

      <div
        className={`hidden lg:relative inset-x-0 top-0 z-30 border-b border-navy-900/10 bg-white/95 shadow-lg shadow-navy-900/10 backdrop-blur-sm transition-all duration-300 ease-out lg:block ${
          fixo
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FormularioFiltros
            categorias={categorias}
            cidades={cidades}
            bairros={bairros}
            compacto
          />
        </div>
      </div>
    </>
  );
}
