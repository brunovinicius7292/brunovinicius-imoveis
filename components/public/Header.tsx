export default function Header() {
  return (
    <header className="bg-navy-800 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tracking-tight">
            Bruno Vinícius
          </span>
          <span className="font-body text-sm uppercase tracking-[0.2em] text-gold-300">
            Imóveis
          </span>
        </div>

        <nav className="hidden items-center gap-8 font-body text-sm text-navy-100 sm:flex">
          <a href="#destaques" className="transition hover:text-gold-300">
            Destaques
          </a>
          <a href="#" className="transition hover:text-gold-300">
            Sobre
          </a>
          <a href="#" className="transition hover:text-gold-300">
            Contato
          </a>
        </nav>
      </div>
    </header>
  );
}
