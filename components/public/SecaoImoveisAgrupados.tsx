"use client";

import { Imovel } from "@/lib/types/imovel";
import CarrosselImoveis from "@/components/public/CarrosselImoveis";
import { capitalizarPalavras, chaveNormalizada } from "@/lib/utils/texto";

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
  if (imoveis.length === 0) return null;

  const grupos = agruparPorCategoria(imoveis);

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
    </section>
  );
}
