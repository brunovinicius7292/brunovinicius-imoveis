// URL pública canônica do site, usada para montar links absolutos
// (mensagem do WhatsApp, metadados de compartilhamento) sem depender de
// window.location.
//
// Fallback fixo: se NEXT_PUBLIC_SITE_URL não estiver configurada no
// ambiente de build (ex.: variável ausente na Vercel), sem este fallback
// a função retorna "" e os links/og:image viram "http://localhost:3000/...",
// que o WhatsApp/Facebook não conseguem acessar — quebrando a prévia do link.
export function obterUrlSite(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.brunoviniciusimoveis.com.br";
  return url.replace(/\/+$/, "");
}

export function obterUrlImovel(slug: string): string {
  return `${obterUrlSite()}/imovel/${slug}`;
}

// og:image padrão do site (Open Graph / Twitter Card) para páginas que não
// têm uma foto específica para mostrar — hoje a Home e "Minha seleção" (que
// só existe no localStorage do navegador de quem compartilha, sem imóvel
// específico pra puxar no servidor). Dimensões reais do arquivo em
// public/capa-hero.png — declarar valor diferente do real faz alguns
// scrapers (WhatsApp incluso) recortar ou descartar a imagem.
export function obterImagemPadraoSite(): {
  url: string;
  width: number;
  height: number;
} {
  return { url: `${obterUrlSite()}/capa-hero.png`, width: 1702, height: 630 };
}
