"use client";

import { useState } from "react";
import { Imovel } from "@/lib/types/imovel";
import CarrosselImoveis from "@/components/public/CarrosselImoveis";
import { capitalizarPalavras, chaveNormalizada } from "@/lib/utils/texto";

// Quantidade de imóveis exibida antes do botão "Ver mais imóveis" aparecer.
const QUANTIDADE_INICIAL = 6;

interface GrupoCategoria {
  rotulo: string;
  imoveis: Imovel[];
}

// Agrupa ignorando maiúsculas/minúsculas e espaços (ex.: "Apartamento" e
// "apartamento" cadastrados com grafias diferentes caem no mesmo carrossel).
function agruparPorCategoria(imoveis: Imovel[]): GrupoCategoria[] {
  const grupos = new Map<string, GrupoCategoria>();

  for (const imovel of imoveis) {
    const tipo = imovel.tipo || "Outros";
    const chave = chaveNormalizada(tipo);
    const grupo = grupos.get(chave);
    if (grupo) {
      grupo.imoveis.push(imovel);
    } else {
      grupos.set(chave, { rotulo: capitalizarPalavras(tipo), imoveis: [imovel] });
    }
  }

  return Array.from(grupos.values()).sort((a, b) =>
    a.rotulo.localeCompare(b.rotulo, "pt-BR")
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
  const grupos = agruparPorCategoria(imoveisVisiveis);

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
        {grupos.map((grupo) => (
          <CarrosselImoveis
            key={grupo.rotulo}
            titulo={grupo.rotulo}
            imoveis={grupo.imoveis}
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
