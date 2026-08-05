"use client";

import { useSelecao } from "@/components/public/SelecaoProvider";

function IconeCoracao({
  preenchido,
  className,
}: {
  preenchido: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={preenchido ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.25s-7.5-4.55-9.75-9.15C.9 8.05 2.3 4.9 5.4 4.2c2-.45 3.9.4 5.1 2.1a1 1 0 0 0 1.5 0c1.2-1.7 3.1-2.55 5.1-2.1 3.1.7 4.5 3.85 3.15 6.9C19.5 15.7 12 20.25 12 20.25Z"
      />
    </svg>
  );
}

export default function BotaoSelecao({
  imovelId,
  variante = "card",
}: {
  imovelId: string;
  variante?: "card" | "detalhe";
}) {
  const { estaSelecionado, alternarSelecao } = useSelecao();
  const selecionado = estaSelecionado(imovelId);
  const rotulo = selecionado ? "Remover da Minha seleção" : "Salvar em Minha seleção";

  if (variante === "detalhe") {
    return (
      <button
        type="button"
        onClick={() => alternarSelecao(imovelId)}
        aria-pressed={selecionado}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 font-body text-sm font-semibold transition ${
          selecionado
            ? "border-gold-400 bg-gold-50 text-gold-700 hover:bg-gold-100"
            : "border-navy-800 text-navy-800 hover:bg-navy-800 hover:text-white"
        }`}
      >
        <IconeCoracao preenchido={selecionado} className="h-5 w-5" />
        {rotulo}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => alternarSelecao(imovelId)}
      aria-pressed={selecionado}
      aria-label={rotulo}
      title={rotulo}
      className={`flex h-9 w-9 items-center justify-center rounded-full shadow-md ring-1 ring-white/10 backdrop-blur-sm transition ${
        selecionado
          ? "bg-gold-400 text-navy-900"
          : "bg-navy-900/70 text-white hover:bg-navy-900/90"
      }`}
    >
      <IconeCoracao preenchido={selecionado} className="h-4 w-4" />
    </button>
  );
}
