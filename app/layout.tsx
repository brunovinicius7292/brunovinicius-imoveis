import type { Metadata } from "next";
import "./globals.css";
import { obterUrlSite } from "@/lib/utils/site";
import { SelecaoProvider } from "@/components/public/SelecaoProvider";

export const metadata: Metadata = {
  metadataBase: new URL(obterUrlSite() || "http://localhost:3000"),
  title: "Bruno Vinícius Imóveis",
  description: "Catálogo de imóveis para venda e aluguel.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <SelecaoProvider>{children}</SelecaoProvider>
      </body>
    </html>
  );
}
