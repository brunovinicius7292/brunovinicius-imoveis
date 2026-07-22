// URL pública canônica do site, usada para montar links absolutos
// (mensagem do WhatsApp, metadados de compartilhamento) sem depender de
// window.location.
export function obterUrlSite(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return url.replace(/\/+$/, "");
}

export function obterUrlImovel(slug: string): string {
  return `${obterUrlSite()}/imovel/${slug}`;
}
