"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { classesInput } from "@/components/ui/CampoFormulario";
import { AtividadeCliente, TipoAtividade } from "@/lib/types/atividade";
import { adicionarNotaManual } from "@/app/(admin)/admin/clientes/atividades-actions";

const ROTULOS_TIPO: Record<TipoAtividade, string> = {
  oferta_whatsapp: "Oferta enviada pelo WhatsApp",
  marcado_enviado: "Marcado como enviado",
  favoritado: "Favoritado",
  ocultado: "Ocultado para este cliente",
  reexibido: "Voltou a aparecer nas sugestões",
  adicionado_manual: "Adicionado manualmente",
  nota_manual: "Nota",
};

function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AtividadesCliente({
  clienteId,
  atividades,
}: {
  clienteId: string;
  atividades: AtividadeCliente[];
}) {
  const router = useRouter();
  const [nota, setNota] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleAdicionarNota() {
    if (!nota.trim()) return;

    setErro(null);
    setSalvando(true);

    const resultado = await adicionarNotaManual(clienteId, nota);

    setSalvando(false);

    if (!resultado.sucesso) {
      setErro(resultado.erro ?? "Não foi possível salvar a nota.");
      return;
    }

    setNota("");
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex-1 min-w-[220px]">
          <span className="mb-1 block font-body text-sm font-medium text-navy-700">
            Adicionar nota
          </span>
          <input
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdicionarNota();
              }
            }}
            placeholder="Ligação realizada, visita agendada..."
            className={classesInput}
          />
        </label>
        <button
          type="button"
          onClick={handleAdicionarNota}
          disabled={!nota.trim() || salvando}
          className="rounded-lg bg-navy-800 px-4 py-2 font-body text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
        >
          {salvando ? "Salvando..." : "Adicionar nota"}
        </button>
      </div>

      {erro && (
        <p role="alert" className="mt-2 font-body text-sm text-red-600">
          {erro}
        </p>
      )}

      {atividades.length === 0 ? (
        <p className="mt-4 font-body text-sm text-navy-400">
          Nenhuma atividade registrada ainda.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-navy-900/5">
          {atividades.map((atividade) => (
            <li key={atividade.id} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-body text-sm font-medium text-navy-800">
                  {ROTULOS_TIPO[atividade.tipo] ?? atividade.tipo}
                </p>
                <p className="font-body text-xs text-navy-400">
                  {formatarDataHora(atividade.criadoEm)}
                </p>
              </div>
              {atividade.imovel && (
                <Link
                  href={`/admin/imoveis/${atividade.imovel.id}/editar`}
                  className="mt-0.5 block font-body text-sm text-navy-600 hover:text-gold-600"
                >
                  {atividade.imovel.titulo}
                </Link>
              )}
              {atividade.descricao && (
                <p className="mt-0.5 font-body text-sm text-navy-600">
                  {atividade.descricao}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
