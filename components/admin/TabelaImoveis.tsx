"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Imovel } from "@/lib/types/imovel";
import { excluirImovel } from "@/app/(admin)/admin/imoveis/actions";
import { formatarMoeda, ROTULOS_FINALIDADE } from "@/lib/utils/preco";

const CLASSES_FINALIDADE: Record<string, string> = {
  venda: "bg-green-100 text-green-700",
  aluguel: "bg-blue-100 text-blue-700",
  venda_aluguel: "bg-purple-100 text-purple-700",
};

function formatarValor(imovel: Imovel) {
  if (imovel.finalidade === "venda_aluguel") {
    return `Venda: ${formatarMoeda(imovel.preco)} · Aluguel: ${formatarMoeda(
      imovel.precoAluguel ?? 0
    )}`;
  }
  return formatarMoeda(imovel.preco);
}

type OrdemValor = "asc" | "desc";

export default function TabelaImoveis({ imoveis }: { imoveis: Imovel[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [idExcluindo, setIdExcluindo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ordemValor, setOrdemValor] = useState<OrdemValor>("asc");

  function alternarOrdemValor() {
    setOrdemValor((atual) => (atual === "asc" ? "desc" : "asc"));
  }

  const imoveisOrdenados = useMemo(() => {
    const multiplicador = ordemValor === "asc" ? 1 : -1;
    return [...imoveis].sort((a, b) => (a.preco - b.preco) * multiplicador);
  }, [imoveis, ordemValor]);

  async function handleExcluir(imovel: Imovel) {
    const confirmar = window.confirm(
      `Excluir o imóvel "${imovel.titulo}"? Essa ação não pode ser desfeita.`
    );
    if (!confirmar) return;

    setErro(null);
    setIdExcluindo(imovel.id);

    const resultado = await excluirImovel(imovel.id);

    setIdExcluindo(null);

    if (!resultado.sucesso) {
      setErro(resultado.erro ?? "Não foi possível excluir o imóvel.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  if (imoveis.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
        <p className="font-body text-sm text-navy-400">
          Nenhum imóvel cadastrado ainda.
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
            <th className="px-4 py-3 font-medium">Código</th>
            <th className="px-4 py-3 font-medium">Título</th>
            <th className="px-4 py-3 font-medium">Finalidade</th>
            <th className="px-4 py-3 font-medium">Categoria</th>
            <th className="px-4 py-3 font-medium">Cidade</th>
            <th className="px-4 py-3 font-medium">Bairro</th>
            <th className="px-4 py-3 font-medium">
              <button
                type="button"
                onClick={alternarOrdemValor}
                className="flex items-center gap-1 font-medium hover:text-navy-700"
              >
                Valor
                {ordemValor === "asc" && <span aria-hidden>↑</span>}
                {ordemValor === "desc" && <span aria-hidden>↓</span>}
              </button>
            </th>
            <th className="px-4 py-3 font-medium">Destaque</th>
            <th className="px-4 py-3 font-medium">Publicado</th>
            <th className="px-4 py-3 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-900/5">
          {imoveisOrdenados.map((imovel) => (
            <tr key={imovel.id}>
              <td className="px-4 py-3 text-navy-600">
                {imovel.codigo || "—"}
              </td>
              <td className="px-4 py-3 font-medium text-navy-900">
                {imovel.titulo}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    CLASSES_FINALIDADE[imovel.finalidade] ??
                    "bg-navy-50 text-navy-600"
                  }`}
                >
                  {ROTULOS_FINALIDADE[imovel.finalidade] ?? imovel.finalidade}
                </span>
              </td>
              <td className="px-4 py-3 text-navy-600">{imovel.tipo}</td>
              <td className="px-4 py-3 text-navy-600">{imovel.cidade}</td>
              <td className="px-4 py-3 text-navy-600">{imovel.bairro}</td>
              <td className="px-4 py-3 text-navy-600">
                {formatarValor(imovel)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    imovel.destaque
                      ? "bg-gold-100 text-gold-700"
                      : "bg-navy-50 text-navy-400"
                  }`}
                >
                  {imovel.destaque ? "Sim" : "Não"}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    imovel.publicado
                      ? "bg-green-100 text-green-700"
                      : "bg-navy-50 text-navy-400"
                  }`}
                >
                  {imovel.publicado ? "Sim" : "Não"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/imoveis/${imovel.id}/editar`}
                    className="font-medium text-navy-700 hover:text-gold-600"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleExcluir(imovel)}
                    disabled={idExcluindo === imovel.id}
                    className="font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {idExcluindo === imovel.id ? "Excluindo..." : "Excluir"}
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
