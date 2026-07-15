import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
      <body>{children}</body>
    </html>
  );
}
