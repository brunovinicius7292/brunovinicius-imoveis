import type { Metadata } from "next";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";

export const metadata: Metadata = {
  title: "Contato | Bruno Vinícius Imóveis",
  description: "Fale com Bruno Vinícius Imóveis pelo WhatsApp ou Instagram.",
};

function formatarTelefone(numero: string): string {
  const digitos = numero.replace(/\D/g, "");
  const cc = digitos.slice(0, 2);
  const ddd = digitos.slice(2, 4);
  const linha = digitos.slice(4);
  const parte1 = linha.slice(0, linha.length - 4);
  const parte2 = linha.slice(-4);
  return `+${cc} (${ddd}) ${parte1}-${parte2}`;
}

export default function PaginaContato() {
  const numeroWhatsapp = (process.env.NEXT_PUBLIC_WHATSAPP_NUMERO ?? "").replace(
    /\D/g,
    ""
  );

  const canais = [
    {
      nome: "WhatsApp",
      Icone: FaWhatsapp,
      texto: formatarTelefone(numeroWhatsapp),
      href: `https://wa.me/${numeroWhatsapp}`,
    },
    {
      nome: "Instagram",
      Icone: FaInstagram,
      texto: "@brunovin.corretor",
      href: "https://instagram.com/brunovin.corretor",
    },
  ];

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-display text-3xl font-semibold text-navy-900 sm:text-4xl">
          Contato
        </h1>
        <p className="mt-2 font-body text-navy-400">
          Fale diretamente com a gente por um dos canais abaixo.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {canais.map(({ nome, Icone, texto, href }) => (
            <a
              key={nome}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-4 rounded-2xl bg-navy-800 p-8 text-center shadow-sm ring-1 ring-navy-900/5 transition hover:bg-navy-900 sm:items-start sm:text-left"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-gold-300 transition group-hover:bg-gold-300 group-hover:text-navy-900">
                <Icone className="h-7 w-7" />
              </span>
              <div>
                <p className="font-display text-xl font-semibold text-white">
                  {nome}
                </p>
                <p className="mt-1 font-body text-sm text-gold-200">
                  {texto}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </main>
  );
}
