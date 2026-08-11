"use client";

import { useState } from "react";
import Link from "next/link";
import LinkMinhaSelecao from "@/components/public/LinkMinhaSelecao";

const CLASSE_ITEM =
  "block rounded-lg px-3 py-3 transition hover:bg-white/5 hover:text-gold-300";

export default function MenuMobile() {
  const [aberto, setAberto] = useState(false);

  function fechar() {
    setAberto(false);
  }

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setAberto((atual) => !atual)}
        aria-expanded={aberto}
        aria-controls="menu-mobile-painel"
        aria-label={aberto ? "Fechar menu" : "Abrir menu"}
        className="flex h-11 w-11 items-center justify-center rounded-full text-navy-100 transition hover:text-gold-300"
      >
        {aberto ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {aberto && (
        <div
          id="menu-mobile-painel"
          className="absolute inset-x-0 top-full z-40 border-t border-white/10 bg-navy-800 px-4 py-3 sm:hidden"
        >
          <nav className="flex flex-col gap-1 font-body text-base text-navy-100">
            <Link href="/" onClick={fechar} className={CLASSE_ITEM}>
              Início
            </Link>
            <a href="#" onClick={fechar} className={CLASSE_ITEM}>
              Sobre
            </a>
            <Link href="/contato" onClick={fechar} className={CLASSE_ITEM}>
              Contato
            </Link>
            <div onClick={fechar}>
              <LinkMinhaSelecao className={CLASSE_ITEM} />
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
