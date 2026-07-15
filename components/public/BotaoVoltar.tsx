"use client";

import { useRouter } from "next/navigation";

export default function BotaoVoltar() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex items-center gap-2 font-body text-sm font-medium text-navy-500 transition hover:text-navy-800"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Voltar
    </button>
  );
}
