"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const itensMenu = [
  { label: "Dashboard", href: "/admin" },
  { label: "Imóveis", href: "/admin/imoveis" },
  { label: "Clientes", href: "/admin/clientes" },
  { label: "Visitas", href: "/admin/visitas" },
  { label: "Estatísticas", href: "/admin/estatisticas" },
  { label: "Configurações", href: "/admin/configuracoes" },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col gap-1 p-4">
      <p className="mb-6 px-2 font-display text-lg font-semibold text-white">
        Bruno Vinícius
      </p>

      {itensMenu.map((item) => {
        const ativo = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={ativo ? "page" : undefined}
            className={`rounded-lg px-3 py-2 font-body text-sm font-medium transition ${
              ativo
                ? "bg-gold-400 text-navy-900"
                : "text-navy-100 hover:bg-navy-800"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
