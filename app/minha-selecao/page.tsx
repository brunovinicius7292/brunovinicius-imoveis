import type { Metadata } from "next";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import ConteudoMinhaSelecao from "@/components/public/ConteudoMinhaSelecao";
import { obterImagemPadraoSite, obterUrlSite } from "@/lib/utils/site";

const TITULO = "Minha seleção | Bruno Vinícius Imóveis";
const DESCRICAO = "Os imóveis que você salvou para comparar ou enviar pelo WhatsApp.";
// A seleção mora só no localStorage de quem compartilha (ver
// SelecaoProvider) — o servidor não sabe quais imóveis estão nela nem tem
// como saber, então aqui não tem "foto de capa específica" pra usar: cai na
// imagem padrão do site, igual à Home.
const IMAGEM_PADRAO = obterImagemPadraoSite();

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${obterUrlSite()}/minha-selecao`,
    type: "website",
    locale: "pt_BR",
    images: [IMAGEM_PADRAO],
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRICAO,
    images: [IMAGEM_PADRAO.url],
  },
};

export default function PaginaMinhaSelecao() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-display text-3xl font-semibold text-navy-900 sm:text-4xl">
          Minha seleção
        </h1>
        <p className="mt-2 font-body text-navy-400">
          Os imóveis que você salvou para comparar ou enviar de uma vez pelo
          WhatsApp.
        </p>

        <div className="mt-8">
          <ConteudoMinhaSelecao />
        </div>
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </main>
  );
}
