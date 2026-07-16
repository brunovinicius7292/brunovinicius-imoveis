"use client";

import { useState } from "react";
import { Imovel } from "@/lib/types/imovel";
import CarrosselImoveis from "@/components/public/CarrosselImoveis";

// Quantidade de imóveis exibida antes do botão "Ver mais imóveis" aparecer.
const QUANTIDADE_INICIAL = 6;

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function agruparPorCategoria(imoveis: Imovel[]): [string, Imovel[]][] {
  const grupos = new Map<string, Imovel[]>();

  for (const imovel of imoveis) {
    const chave = imovel.tipo || "Outros";
    const lista = grupos.get(chave) ?? [];
    lista.push(imovel);
    grupos.set(chave, lista);
  }

  return Array.from(grupos.entries()).sort((a, b) =>
    a[0].localeCompare(b[0], "pt-BR")
  );
}

export default function SecaoImoveisAgrupados({
  legenda,
  titulo,
  imoveis,
  contexto,
}: {
  legenda: string;
  titulo: string;
  imoveis: Imovel[];
  // Repassado ao card para decidir, em imóveis "venda_aluguel", qual valor
  // exibir: só o de venda nesta seção, ou só o de aluguel.
  contexto?: "venda" | "aluguel";
}) {
  const [mostrarTodos, setMostrarTodos] = useState(false);

  if (imoveis.length === 0) return null;

  const imoveisVisiveis = mostrarTodos
    ? imoveis
    : imoveis.slice(0, QUANTIDADE_INICIAL);
  const temMaisImoveis = !mostrarTodos && imoveis.length > QUANTIDADE_INICIAL;
  const categorias = agruparPorCategoria(imoveisVisiveis);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="mb-8">
        <p className="font-body text-sm font-medium uppercase tracking-[0.2em] text-gold-600">
          {legenda}
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-navy-900">
          {titulo}
        </h2>
      </div>

      <div className="flex flex-col gap-10">
        {categorias.map(([categoria, imoveisDaCategoria]) => (
          <CarrosselImoveis
            key={categoria}
            titulo={capitalizar(categoria)}
            imoveis={imoveisDaCategoria}
            contexto={contexto}
          />
        ))}
      </div>

      {temMaisImoveis && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setMostrarTodos(true)}
            className="rounded-xl border border-navy-800 px-8 py-3 font-body text-sm font-semibold text-navy-800 transition hover:bg-navy-800 hover:text-white"
          >
            Ver mais imóveis
          </button>
        </div>
      )}
    </section>
  );
}
