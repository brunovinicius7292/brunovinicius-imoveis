"use client";

import Link from "next/link";
import { useSelecao } from "@/components/public/SelecaoProvider";

export default function LinkMinhaSelecao({
  className = "transition hover:text-gold-300",
}: {
  className?: string;
}) {
  const { selecionados } = useSelecao();

  return (
    <Link href="/minha-selecao" className={className}>
      Minha seleção ({selecionados.length})
    </Link>
  );
}
