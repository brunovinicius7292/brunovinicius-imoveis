"use client";

import { useState } from "react";

export default function BotaoCompartilhar({ titulo }: { titulo: string }) {
  const [copiado, setCopiado] = useState(false);

  async function compartilhar() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
      } catch {
        // usuário cancelou o compartilhamento — nada a fazer
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={compartilhar}
      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-navy-800 py-3 font-body text-sm font-semibold text-navy-800 transition hover:bg-navy-800 hover:text-white"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.7 10.3 15.3 7M8.7 13.7l6.6 3.3M18 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm0 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
      </svg>
      {copiado ? "Link copiado!" : "Compartilhar"}
    </button>
  );
}
