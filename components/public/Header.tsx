import Image from "next/image";
import Link from "next/link";
import LinkMinhaSelecao from "@/components/public/LinkMinhaSelecao";
import MenuMobile from "@/components/public/MenuMobile";

export default function Header() {
  return (
    <header className="relative bg-navy-800 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/*
          O arquivo original tem bastante espaço transparente ao redor da
          marca (respiro do logotipo oficial). Em um espaço tão pequeno quanto
          a navbar isso deixaria o "B|V" ilegível, então a imagem é ampliada e
          recortada (sem alterar o arquivo original) para mostrar só a área
          com conteúdo visível.
        */}
        <div className="relative aspect-[221/164] h-11 overflow-hidden sm:h-12">
          <Image
            src="/image.png"
            alt="Bruno Vinícius Imóveis"
            fill
            priority
            sizes="90px"
            className="scale-[1.77] object-cover object-center"
          />
        </div>

        <nav className="hidden items-center gap-8 font-body text-sm text-navy-100 sm:flex">
          <Link href="/" className="transition hover:text-gold-300">
            Início
          </Link>
          <a href="#" className="transition hover:text-gold-300">
            Sobre
          </a>
          <Link href="/contato" className="transition hover:text-gold-300">
            Contato
          </Link>
          <LinkMinhaSelecao />
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-full border border-gold-400/60 px-4 py-1.5 text-gold-300 transition hover:bg-gold-400 hover:text-navy-900"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="h-4 w-4"
            >
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            Área do Corretor
          </Link>
        </nav>

        <MenuMobile />
      </div>
    </header>
  );
}
