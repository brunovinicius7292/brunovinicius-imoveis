"use client";

import { useMemo, useState } from "react";
import { Cliente, FinalidadeCliente } from "@/lib/types/cliente";
import FiltrosClientes from "@/components/admin/FiltrosClientes";

const ABAS: { valor: FinalidadeCliente; rotulo: string }[] = [
  { valor: "venda", rotulo: "Venda" },
  { valor: "aluguel", rotulo: "Aluguel" },
];

export default function AbasClientesFinalidade({
  clientes,
}: {
  clientes: Cliente[];
}) {
  const [abaAtiva, setAbaAtiva] = useState<FinalidadeCliente>("venda");

  const contagens = useMemo(
    () => ({
      venda: clientes.filter((c) => c.finalidade === "venda").length,
      aluguel: clientes.filter((c) => c.finalidade === "aluguel").length,
    }),
    [clientes]
  );

  const clientesDaAba = useMemo(
    () => clientes.filter((c) => c.finalidade === abaAtiva),
    [clientes, abaAtiva]
  );

  return (
    <div>
      <div
        role="tablist"
        aria-label="Finalidade dos clientes"
        className="inline-flex rounded-xl bg-navy-50 p-1"
      >
        {ABAS.map((aba) => (
          <button
            key={aba.valor}
            type="button"
            role="tab"
            aria-selected={abaAtiva === aba.valor}
            onClick={() => setAbaAtiva(aba.valor)}
            className={`rounded-lg px-5 py-2 font-body text-sm font-semibold transition ${
              abaAtiva === aba.valor
                ? "bg-navy-800 text-white"
                : "text-navy-500 hover:text-navy-800"
            }`}
          >
            {aba.rotulo} ({contagens[aba.valor]})
          </button>
        ))}
      </div>

      <div className="mt-4">
        <FiltrosClientes key={abaAtiva} clientes={clientesDaAba} />
      </div>
    </div>
  );
}
