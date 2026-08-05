"use client";

import Link from "next/link";
import { useSelecao } from "@/components/public/SelecaoProvider";

export default function LinkMinhaSelecao() {
  const { selecionados } = useSelecao();

  return (
    <Link href="/minha-selecao" className="transition hover:text-gold-300">
      Minha seleção ({selecionados.length})
    </Link>
  );
}
