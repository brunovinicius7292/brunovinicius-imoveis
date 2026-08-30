"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cliente } from "@/lib/types/cliente";
import { excluirCliente } from "@/app/(admin)/admin/clientes/actions";
import { formatarMoeda } from "@/lib/utils/preco";
import { formatarWhatsapp, linkWhatsapp } from "@/lib/utils/whatsapp";

const CLASSES_TEMPERATURA: Record<string, string> = {
  quente: "bg-red-100 text-red-700",
  morno: "bg-amber-100 text-amber-700",
  frio: "bg-blue-100 text-blue-700",
};

const ROTULOS_TEMPERATURA: Record<string, string> = {
  quente: "Quente",
  morno: "Morno",
  frio: "Frio",
};

const ROTULOS_PAGAMENTO: Record<string, string> = {
  a_vista: "À vista",
  financiado: "Financiado",
  indefinido: "Indefinido",
};

function formatarFaixaValor(cliente: Cliente) {
  if (cliente.valorMin != null && cliente.valorMax != null) {
    return `${formatarMoeda(cliente.valorMin)} – ${formatarMoeda(
      cliente.valorMax
    )}`;
  }
  if (cliente.valorMin != null) {
    return `A partir de ${formatarMoeda(cliente.valorMin)}`;
  }
  if (cliente.valorMax != null) {
    return `Até ${formatarMoeda(cliente.valorMax)}`;
  }
  return "—";
}

export default function TabelaClientes({ clientes }: { clientes: Cliente[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [idExcluindo, setIdExcluindo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function handleExcluir(cliente: Cliente) {
    const confirmar = window.confirm(
      `Excluir o cliente "${cliente.nome}"? Essa ação não pode ser desfeita.`
    );
    if (!confirmar) return;

    setErro(null);
    setIdExcluindo(cliente.id);

    const resultado = await excluirCliente(cliente.id);

    setIdExcluindo(null);

    if (!resultado.sucesso) {
      setErro(resultado.erro ?? "Não foi possível excluir o cliente.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  if (clientes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
        <p className="font-body text-sm text-navy-400">
          Nenhum cliente cadastrado ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5">
      {erro && (
        <p
          role="alert"
          className="border-b border-red-100 bg-red-50 px-4 py-2 font-body text-sm text-red-600"
        >
          {erro}
        </p>
      )}

      <table className="w-full min-w-[900px] text-left font-body text-sm">
        <thead className="bg-navy-50 text-navy-500">
          <tr>
            <th className="px-4 py-3 font-medium">Nome</th>
            <th className="px-4 py-3 font-medium">WhatsApp</th>
            <th className="px-4 py-3 font-medium">Interesse</th>
            <th className="px-4 py-3 font-medium">Faixa de valor</th>
            <th className="px-4 py-3 font-medium">Pagamento</th>
            <th className="px-4 py-3 font-medium">Temperatura</th>
            <th className="px-4 py-3 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-900/5">
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td className="px-4 py-3 font-medium text-navy-900">
                {cliente.nome}
              </td>
              <td className="px-4 py-3 text-navy-600">
                <a
                  href={linkWhatsapp(cliente.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:underline"
                >
                  {formatarWhatsapp(cliente.whatsapp)}
                </a>
              </td>
              <td className="px-4 py-3 text-navy-600">
                {cliente.interesseTipos.length > 0
                  ? cliente.interesseTipos.join(", ")
                  : "—"}
              </td>
              <td className="px-4 py-3 text-navy-600">
                {formatarFaixaValor(cliente)}
              </td>
              <td className="px-4 py-3 text-navy-600">
                {ROTULOS_PAGAMENTO[cliente.formaPagamento] ??
                  cliente.formaPagamento}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    CLASSES_TEMPERATURA[cliente.temperatura] ??
                    "bg-navy-50 text-navy-600"
                  }`}
                >
                  {ROTULOS_TEMPERATURA[cliente.temperatura] ??
                    cliente.temperatura}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/clientes/${cliente.id}/editar`}
                    className="font-medium text-navy-700 hover:text-gold-600"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleExcluir(cliente)}
                    disabled={idExcluindo === cliente.id}
                    className="font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {idExcluindo === cliente.id ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
