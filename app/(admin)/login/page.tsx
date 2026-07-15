"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setCarregando(false);

    if (error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-900 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <p className="font-display text-xl font-semibold text-navy-900">
            Bruno Vinícius Imóveis
          </p>
          <p className="mt-1 font-body text-sm text-navy-400">
            Painel administrativo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block font-body text-sm font-medium text-navy-700"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              className="w-full rounded-lg border border-navy-200 px-3 py-2 font-body text-navy-800 focus:border-gold-400 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="senha"
              className="mb-1 block font-body text-sm font-medium text-navy-700"
            >
              Senha
            </label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              required
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              className="w-full rounded-lg border border-navy-200 px-3 py-2 font-body text-navy-800 focus:border-gold-400 focus:outline-none"
            />
          </div>

          {erro && (
            <p role="alert" className="font-body text-sm text-red-600">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="mt-2 rounded-lg bg-navy-800 py-2.5 font-body text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
