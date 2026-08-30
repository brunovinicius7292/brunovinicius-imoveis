"use client";

import { useState } from "react";

const CLASSES_PADRAO =
  "flex flex-1 items-center justify-center gap-2 rounded-xl border border-navy-800 py-3 font-body text-sm font-semibold text-navy-800 transition hover:bg-navy-800 hover:text-white";

export default function BotaoCompartilhar({
  titulo,
  url,
  className,
}: {
  titulo: string;
  // URL a compartilhar — por padrão usa a página atual (uso original, na
  // página pública do imóvel). Os cards do Radar (admin) passam a URL
  // pública do imóvel explicitamente, já que a página atual ali é uma URL
  // privada de /admin.
  url?: string;
  className?: string;
}) {
  const [copiado, setCopiado] = useState(false);

  async function compartilhar() {
    const alvo = url ?? window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url: alvo });
      } catch {
        // usuário cancelou o compartilhamento — nada a fazer
      }
      return;
    }

    await navigator.clipboard.writeText(alvo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={compartilhar}
      className={className ?? CLASSES_PADRAO}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.7 10.3 15.3 7M8.7 13.7l6.6 3.3M18 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm0 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
      </svg>
      {copiado ? "Link copiado!" : "Compartilhar"}
    </button>
  );
}
