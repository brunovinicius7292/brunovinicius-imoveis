"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function BotaoSair() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function sair() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={sair}
      className="rounded-lg border border-navy-800 px-4 py-2 font-body text-sm font-medium text-navy-800 transition hover:bg-navy-800 hover:text-white"
    >
      Sair
    </button>
  );
}
