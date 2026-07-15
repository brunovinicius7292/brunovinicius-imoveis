export default function Footer() {
  return (
    <footer className="bg-navy-900">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-lg font-semibold text-white">
              Bruno Vinícius Imóveis
            </p>
            <p className="mt-1 font-body text-sm text-navy-300">
              @brunovin.corretor
            </p>
          </div>

          <p className="font-body text-sm text-navy-400">
            © {new Date().getFullYear()} Bruno Vinícius Imóveis. Todos os
            direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
