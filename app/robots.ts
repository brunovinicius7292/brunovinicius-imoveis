import type { MetadataRoute } from "next";
import { obterUrlSite } from "@/lib/utils/site";

// Bots que só consomem banda (crawlers de treinamento de IA e scrapers de SEO
// agressivos) sem trazer clientes reais — bloqueados por completo. Buscadores
// de verdade (Googlebot, Bingbot) continuam liberados para não prejudicar o
// SEO do site.
const BOTS_BLOQUEADOS = [
  "GPTBot",
  "ChatGPT-User",
  "CCBot",
  "Google-Extended",
  "Bytespider",
  "PetalBot",
  "Amazonbot",
  "Applebot-Extended",
  "ClaudeBot",
  "anthropic-ai",
  "cohere-ai",
  "Diffbot",
  "MJ12bot",
  "SemrushBot",
  "AhrefsBot",
  "DotBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/login"],
      },
      ...BOTS_BLOQUEADOS.map((userAgent) => ({
        userAgent,
        disallow: "/",
      })),
    ],
    host: obterUrlSite(),
  };
}
