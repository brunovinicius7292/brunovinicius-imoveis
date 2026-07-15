// Extrai o ID de um vídeo do YouTube a partir de um link completo ou curto.
// Aceita formatos como:
//   https://www.youtube.com/watch?v=VIDEOID
//   https://youtu.be/VIDEOID
//   https://www.youtube.com/embed/VIDEOID
//   https://www.youtube.com/shorts/VIDEOID
export function extrairIdYoutube(url: string): string | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url.trim());
    const host = urlObj.hostname.replace(/^www\./, "").replace(/^m\./, "");

    if (host === "youtu.be") {
      return urlObj.pathname.slice(1).split("/")[0] || null;
    }

    if (host === "youtube.com") {
      if (urlObj.pathname === "/watch") {
        return urlObj.searchParams.get("v");
      }
      if (urlObj.pathname.startsWith("/embed/")) {
        return urlObj.pathname.split("/embed/")[1]?.split("/")[0] || null;
      }
      if (urlObj.pathname.startsWith("/shorts/")) {
        return urlObj.pathname.split("/shorts/")[1]?.split("/")[0] || null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function ehLinkYoutubeValido(url: string): boolean {
  return extrairIdYoutube(url) !== null;
}

// Ainda não utilizada no site público (fora do escopo desta etapa), mas
// pronta para quando a página do imóvel passar a incorporar o vídeo
// automaticamente: monta a URL de embed a partir do link salvo no banco.
export function obterUrlEmbedYoutube(url?: string | null): string | null {
  if (!url) return null;
  const id = extrairIdYoutube(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

// Monta a URL da thumbnail oficial do vídeo. "maxresdefault" é a de maior
// qualidade, mas nem todo vídeo tem essa resolução gerada — quando isso
// acontece, o YouTube responde com uma imagem cinza de 120x90, então quem
// exibe a thumbnail deve detectar esse caso e trocar para "hqdefault"
// (sempre disponível). Ver components/public/ImagemImovel.tsx.
export function obterThumbnailYoutube(
  url?: string | null,
  qualidade: "maxresdefault" | "hqdefault" = "maxresdefault"
): string | null {
  const id = extrairIdYoutube(url ?? "");
  return id ? `https://img.youtube.com/vi/${id}/${qualidade}.jpg` : null;
}
