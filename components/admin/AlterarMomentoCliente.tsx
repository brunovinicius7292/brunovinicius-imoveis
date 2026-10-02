"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MomentoComercial, MotivoEncerramento } from "@/lib/types/cliente";
import {
  ROTULOS_MOMENTO,
  CLASSES_MOMENTO,
  ROTULOS_MOTIVO_ENCERRAMENTO,
} from "@/lib/utils/cliente";
import { alterarMomentoCliente } from "@/app/(admin)/admin/clientes/actions";
import { classesInput } from "@/components/ui/CampoFormulario";

const OPCOES_MOMENTO: MomentoComercial[] = [
  "buscando",
  "em_negociacao",
  "fechado",
  "encerrado_sem_negocio",
];

const OPCOES_MOTIVO: MotivoEncerramento[] = [
  "fechou_com_outra",
  "desistiu",
  "sem_retorno",
  "sem_perfil_momento",
  "outro",
];

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
  const [pedindoMotivo, setPedindoMotivo] = useState(false);
  const [motivoSelecionado, setMotivoSelecionado] = useState<MotivoEncerramento | "">("");

  async function salvarMomento(
    novoMomento: MomentoComercial,
    motivo?: MotivoEncerramento
  ) {
    setErro(null);
    setCarregando(true);

    const resultado = await alterarMomentoCliente(clienteId, novoMomento, motivo);

    setCarregando(false);

    if (!resultado.sucesso) {
      setErro(resultado.erro ?? "Não foi possível atualizar o momento do cliente.");
      return;
    }

    setPedindoMotivo(false);
    setMotivoSelecionado("");
    router.refresh();
  }

  function handleEscolherMomento(novoMomento: MomentoComercial) {
    if (novoMomento === momento) return;
    setErro(null);

    if (novoMomento === "encerrado_sem_negocio") {
      // Exige o motivo antes de salvar — não chama a action ainda.
      setPedindoMotivo(true);
      return;
    }

    setPedindoMotivo(false);
    salvarMomento(novoMomento);
  }

  function handleConfirmarEncerramento() {
    if (!motivoSelecionado) {
      setErro("Selecione o motivo do encerramento.");
      return;
    }
    salvarMomento("encerrado_sem_negocio", motivoSelecionado);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {OPCOES_MOMENTO.map((opcao) => (
          <button
            key={opcao}
            type="button"
            disabled={carregando}
            onClick={() => handleEscolherMomento(opcao)}
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

      {pedindoMotivo && (
        <div className="mt-2 flex flex-wrap items-end gap-2 rounded-lg border border-navy-200 bg-navy-50/50 p-3">
          <label className="flex-1 min-w-[220px]">
            <span className="mb-1 block font-body text-xs font-medium text-navy-700">
              Motivo do encerramento (obrigatório)
            </span>
            <select
              value={motivoSelecionado}
              onChange={(e) => setMotivoSelecionado(e.target.value as MotivoEncerramento)}
              className={classesInput}
            >
              <option value="">Selecione o motivo...</option>
              {OPCOES_MOTIVO.map((motivo) => (
                <option key={motivo} value={motivo}>
                  {ROTULOS_MOTIVO_ENCERRAMENTO[motivo]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={carregando || !motivoSelecionado}
            onClick={handleConfirmarEncerramento}
            className="rounded-lg bg-navy-800 px-4 py-2 font-body text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-50"
          >
            {carregando ? "Salvando..." : "Confirmar"}
          </button>
          <button
            type="button"
            disabled={carregando}
            onClick={() => {
              setPedindoMotivo(false);
              setMotivoSelecionado("");
              setErro(null);
            }}
            className="rounded-lg border border-navy-300 px-4 py-2 font-body text-sm font-semibold text-navy-700 transition hover:bg-navy-50 disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      )}

      {erro && (
        <p role="alert" className="mt-1.5 font-body text-xs text-red-600">
          {erro}
        </p>
      )}
    </div>
  );
}
