// Normalização de texto usada para deduplicar/agrupar campos livres
// (tipo, cidade, bairro) que podem ter sido digitados com grafias diferentes
// (maiúsculas/minúsculas, espaços extras) no cadastro.

// Remove espaços duplicados/nas pontas.
export function normalizarTexto(texto: string) {
  return texto.trim().replace(/\s+/g, " ");
}

// Chave usada para deduplicar/agrupar ignorando maiúsculas/minúsculas e espaços.
export function chaveNormalizada(texto: string) {
  return normalizarTexto(texto).toLowerCase();
}

// Rótulo exibido ao usuário, com a primeira letra de cada palavra maiúscula,
// independente de como foi digitado no cadastro (ex.: "itabuna" -> "Itabuna").
export function capitalizarPalavras(texto: string) {
  return normalizarTexto(texto)
    .split(" ")
    .map((palavra) =>
      palavra ? palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase() : palavra
    )
    .join(" ");
}
