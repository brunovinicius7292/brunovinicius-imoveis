"use client";

import { useMemo, useState } from "react";
import { Cliente, FinalidadeCliente, MomentoComercial } from "@/lib/types/cliente";
import { ROTULOS_MOMENTO } from "@/lib/utils/cliente";
import FiltrosClientes from "@/components/admin/FiltrosClientes";

const ABAS: { valor: FinalidadeCliente; rotulo: string }[] = [
  { valor: "venda", rotulo: "Venda" },
  { valor: "aluguel", rotulo: "Aluguel" },
];

// "Em busca" é o grupo padrão — é onde o corretor precisa concentrar atenção.
const ABAS_MOMENTO: { valor: MomentoComercial; rotulo: string }[] = [
  { valor: "buscando", rotulo: ROTULOS_MOMENTO.buscando },
  { valor: "em_negociacao", rotulo: ROTULOS_MOMENTO.em_negociacao },
  { valor: "fechado", rotulo: ROTULOS_MOMENTO.fechado },
  { valor: "encerrado_sem_negocio", rotulo: ROTULOS_MOMENTO.encerrado_sem_negocio },
];

export default function AbasClientesFinalidade({
  clientes,
}: {
  clientes: Cliente[];
}) {
  const [abaAtiva, setAbaAtiva] = useState<FinalidadeCliente>("venda");
  const [momentoAtivo, setMomentoAtivo] = useState<MomentoComercial>("buscando");

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

  const contagensMomento = useMemo(
    () => ({
      buscando: clientesDaAba.filter((c) => c.momento === "buscando").length,
      em_negociacao: clientesDaAba.filter((c) => c.momento === "em_negociacao").length,
      fechado: clientesDaAba.filter((c) => c.momento === "fechado").length,
      encerrado_sem_negocio: clientesDaAba.filter(
        (c) => c.momento === "encerrado_sem_negocio"
      ).length,
    }),
    [clientesDaAba]
  );

  const clientesDoMomento = useMemo(
    () => clientesDaAba.filter((c) => c.momento === momentoAtivo),
    [clientesDaAba, momentoAtivo]
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

      <div
        role="tablist"
        aria-label="Momento comercial dos clientes"
        className="mt-3 inline-flex flex-wrap gap-1 rounded-xl border border-navy-100 p-1"
      >
        {ABAS_MOMENTO.map((aba) => (
          <button
            key={aba.valor}
            type="button"
            role="tab"
            aria-selected={momentoAtivo === aba.valor}
            onClick={() => setMomentoAtivo(aba.valor)}
            className={`rounded-lg px-4 py-1.5 font-body text-sm font-medium transition ${
              momentoAtivo === aba.valor
                ? "bg-gold-100 text-navy-900"
                : "text-navy-500 hover:text-navy-800"
            }`}
          >
            {aba.rotulo} ({contagensMomento[aba.valor]})
          </button>
        ))}
      </div>

      <div className="mt-4">
        <FiltrosClientes key={`${abaAtiva}-${momentoAtivo}`} clientes={clientesDoMomento} />
      </div>
    </div>
  );
}
