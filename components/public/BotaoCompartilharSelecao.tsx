"use client";

import { useState } from "react";
import { compartilharSelecao } from "@/app/minha-selecao/actions";
import { compartilharOuCopiarLink } from "@/lib/utils/compartilhar";
import { obterUrlSite } from "@/lib/utils/site";

export default function BotaoCompartilharSelecao({
  imovelIds,
}: {
  imovelIds: string[];
}) {
  const [carregando, setCarregando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleClick() {
    setErro(null);
    setCopiado(false);
    setCarregando(true);

    const resultado = await compartilharSelecao(imovelIds);

    if (!resultado.sucesso || !resultado.codigo) {
      setCarregando(false);
      setErro(resultado.erro ?? "Não foi possível gerar o link.");
      return;
    }

    const url = `${obterUrlSite()}/selecao/${resultado.codigo}`;
    const { copiado: usouClipboard } = await compartilharOuCopiarLink(
      "Imóveis selecionados para você",
      url
    );

    setCarregando(false);
    if (usouClipboard) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={carregando}
        className="flex items-center justify-center gap-2 rounded-xl border border-navy-800 py-3 font-body text-sm font-semibold text-navy-800 transition hover:bg-navy-800 hover:text-white disabled:opacity-60 sm:w-auto sm:px-8"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.7 10.3 15.3 7M8.7 13.7l6.6 3.3M18 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm0 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
        </svg>
        {carregando
          ? "Gerando link..."
          : copiado
            ? "Link copiado!"
            : "Compartilhar seleção"}
      </button>
      {erro && (
        <p role="alert" className="font-body text-xs text-red-600">
          {erro}
        </p>
      )}
    </div>
  );
}
