"use client";

import { useState } from "react";

export default function FilterButtons() {
  const [ativo, setAtivo] = useState<"venda" | "aluguel">("venda");

  const opcoes: { label: string; value: "venda" | "aluguel" }[] = [
    { label: "Venda", value: "venda" },
    { label: "Aluguel", value: "aluguel" },
  ];

  return (
    <div
      role="tablist"
      aria-label="Finalidade do imóvel"
      className="inline-flex rounded-xl bg-navy-900/40 p-1 backdrop-blur-sm"
    >
      {opcoes.map((opcao) => (
        <button
          key={opcao.value}
          type="button"
          role="tab"
          aria-selected={ativo === opcao.value}
          onClick={() => setAtivo(opcao.value)}
          className={`rounded-lg px-6 py-2 font-body text-sm font-semibold transition ${
            ativo === opcao.value
              ? "bg-gold-400 text-navy-900"
              : "text-white hover:text-gold-300"
          }`}
        >
          {opcao.label}
        </button>
      ))}
    </div>
  );
}
