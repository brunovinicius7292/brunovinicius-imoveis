"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MomentoComercial } from "@/lib/types/cliente";
import { ROTULOS_MOMENTO, CLASSES_MOMENTO } from "@/lib/utils/cliente";
import { alterarMomentoCliente } from "@/app/(admin)/admin/clientes/actions";

const OPCOES_MOMENTO: MomentoComercial[] = ["buscando", "em_negociacao", "fechado"];

export default function AlterarMomentoCliente({
  clienteId,
  momento,
}: {
  clienteId: string;
  momento: MomentoComercial;
}) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleAlterar(novoMomento: MomentoComercial) {
    if (novoMomento === momento) return;

    setErro(null);
    setCarregando(true);

    const resultado = await alterarMomentoCliente(clienteId, novoMomento);

    setCarregando(false);

    if (!resultado.sucesso) {
      setErro(resultado.erro ?? "Não foi possível atualizar o momento do cliente.");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {OPCOES_MOMENTO.map((opcao) => (
          <button
            key={opcao}
            type="button"
            disabled={carregando}
            onClick={() => handleAlterar(opcao)}
            aria-pressed={momento === opcao}
            className={`rounded-full border px-3 py-1.5 font-body text-xs font-semibold transition disabled:opacity-50 ${
              momento === opcao
                ? `border-transparent ${CLASSES_MOMENTO[opcao]}`
                : "border-navy-200 text-navy-500 hover:border-navy-300"
            }`}
          >
            {ROTULOS_MOMENTO[opcao]}
          </button>
        ))}
      </div>
      {erro && (
        <p role="alert" className="mt-1.5 font-body text-xs text-red-600">
          {erro}
        </p>
      )}
    </div>
  );
}
