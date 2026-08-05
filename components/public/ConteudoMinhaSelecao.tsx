"use client";

import { useEffect, useState } from "react";
import { useSelecao } from "@/components/public/SelecaoProvider";
import { buscarImoveisSelecionados } from "@/app/minha-selecao/actions";
import { Imovel } from "@/lib/types/imovel";
import ImovelCard from "@/components/public/ImovelCard";
import { obterUrlImovel } from "@/lib/utils/site";

function apenasNumeros(valor: string) {
  return valor.replace(/\D/g, "");
}

function montarMensagemWhatsapp(imoveis: Imovel[]) {
  const linhas = imoveis.map(
    (imovel, indice) =>
      `${indice + 1}. ${imovel.titulo} - ${obterUrlImovel(imovel.slug)}`
  );

  return `Olá! Tenho interesse nestes imóveis:\n${linhas.join(
    "\n"
  )}\n\nPoderia me passar mais informações?`;
}

export default function ConteudoMinhaSelecao() {
  const { selecionados, removerDaSelecao } = useSelecao();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);

    buscarImoveisSelecionados(selecionados).then((resultado) => {
      if (!cancelado) {
        setImoveis(resultado);
        setCarregando(false);
      }
    });

    return () => {
      cancelado = true;
    };
  }, [selecionados]);

  if (carregando) {
    return (
      <p className="font-body text-sm text-navy-400">Carregando sua seleção…</p>
    );
  }

  if (selecionados.length === 0 || imoveis.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
        <p className="font-body text-sm text-navy-400">
          Você ainda não salvou nenhum imóvel. Clique no coração em qualquer
          imóvel para adicioná-lo à sua seleção.
        </p>
      </div>
    );
  }

  const numero = apenasNumeros(process.env.NEXT_PUBLIC_WHATSAPP_NUMERO ?? "");
  const hrefWhatsapp = `https://wa.me/${numero}?text=${encodeURIComponent(
    montarMensagemWhatsapp(imoveis)
  )}`;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {imoveis.map((imovel) => (
          <div key={imovel.id} className="flex flex-col gap-3">
            <ImovelCard imovel={imovel} />
            <button
              type="button"
              onClick={() => removerDaSelecao(imovel.id)}
              className="self-start font-body text-sm font-medium text-navy-500 transition hover:text-navy-800"
            >
              Remover da seleção
            </button>
          </div>
        ))}
      </div>

      <a
        href={hrefWhatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 font-body text-sm font-semibold text-white transition hover:brightness-95 sm:w-auto sm:self-start sm:px-8"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M17.47 14.38c-.29-.15-1.7-.84-1.96-.94-.26-.1-.46-.15-.65.15-.2.29-.75.94-.92 1.13-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.71-1.6-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.48.1-.2.05-.37-.02-.51-.07-.15-.65-1.58-.9-2.16-.24-.57-.48-.49-.65-.5h-.56c-.2 0-.51.07-.78.37-.26.29-1.02 1-1.02 2.43 0 1.44 1.05 2.83 1.2 3.02.15.2 2.06 3.15 5 4.42.7.3 1.24.48 1.67.62.7.22 1.34.19 1.84.11.56-.08 1.7-.7 1.94-1.37.24-.68.24-1.26.17-1.38-.07-.13-.26-.2-.55-.35Z" />
          <path d="M12.01 2C6.5 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.06-1.33A9.96 9.96 0 0 0 12.01 22C17.52 22 22 17.52 22 12S17.52 2 12.01 2Zm0 18.1c-1.7 0-3.28-.5-4.6-1.35l-.33-.2-3.02.79.8-2.94-.21-.34A8.09 8.09 0 0 1 3.9 12c0-4.47 3.64-8.1 8.11-8.1 4.47 0 8.1 3.63 8.1 8.1 0 4.47-3.63 8.1-8.1 8.1Z" />
        </svg>
        Enviar minha seleção pelo WhatsApp
      </a>
    </div>
  );
}
