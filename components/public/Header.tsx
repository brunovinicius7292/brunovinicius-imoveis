import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-navy-800 text-white">
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
