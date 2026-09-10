import { randomBytes } from "crypto";

// Alfabeto sem caracteres ambíguos (sem 0/O, 1/l/I) — o código pode
// precisar ser lido/digitado manualmente pelo cliente.
const ALFABETO = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export const TAMANHO_CODIGO_SELECAO = 10;

// Código curto, aleatório e não adivinhável para o link de seleção
// compartilhada (/selecao/<codigo>). Usa crypto.randomBytes (não o
// Math.random usado em nomes de arquivo de foto em imoveis/actions.ts, que
// não precisa ser imprevisível) — aqui o código é a única barreira de
// acesso à seleção, então precisa de aleatoriedade forte.
export function gerarCodigoSelecao(): string {
  const bytes = randomBytes(TAMANHO_CODIGO_SELECAO);
  return Array.from(bytes, (byte) => ALFABETO[byte % ALFABETO.length]).join("");
}
