"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import BotaoSair from "@/components/admin/BotaoSair";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar — desktop */}
      <div className="hidden w-64 flex-shrink-0 bg-navy-900 lg:block">
        <Sidebar />
      </div>

      {/* Sidebar — drawer mobile */}
      {menuAberto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-900/60"
            onClick={() => setMenuAberto(false)}
            aria-hidden="true"
          />
          <div className="relative z-50 h-full w-64 bg-navy-900 shadow-xl">
            <Sidebar onNavigate={() => setMenuAberto(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-navy-900/10 bg-white px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
            className="text-navy-800 lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <p className="font-display text-lg font-semibold text-navy-900 lg:hidden">
            Painel
          </p>

          <div className="ml-auto">
            <BotaoSair />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
