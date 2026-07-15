import Link from "next/link";

export default function SemResultados() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-navy-900/5">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-navy-400">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            className="h-7 w-7"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3.5-3.5" />
          </svg>
        </span>

        <h2 className="mt-4 font-display text-xl font-semibold text-navy-900">
          Nenhum imóvel encontrado
        </h2>
        <p className="mt-2 font-body text-sm text-navy-500">
          Tente alterar ou remover alguns filtros.
        </p>

        <Link
          href="/"
          className="mt-6 rounded-xl bg-navy-800 px-6 py-2.5 font-body text-sm font-semibold text-white transition hover:bg-navy-700"
        >
          Limpar filtros
        </Link>
      </div>
    </div>
  );
}
