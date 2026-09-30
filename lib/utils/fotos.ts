// Funções puras de ordenação/capa das fotos de um imóvel — extraídas para
// serem testáveis sem depender do Supabase nem de renderizar componentes.
// Usadas tanto pelo painel admin (GerenciadorFotos, actions.ts) quanto pelo
// mapeamento de imóveis (lib/supabase/imoveis.ts e imoveis-admin.ts).

export interface FotoOrdenavel {
  ordem?: number | null;
}

// Move o item de `indiceOrigem` para `indiceDestino`, usado tanto pelo
// drag-and-drop quanto pelos botões de mover para cima/baixo.
export function moverItem<T>(
  lista: T[],
  indiceOrigem: number,
  indiceDestino: number
): T[] {
  if (
    indiceOrigem === indiceDestino ||
    indiceOrigem < 0 ||
    indiceOrigem >= lista.length ||
    indiceDestino < 0 ||
    indiceDestino >= lista.length
  ) {
    return lista;
  }

  const copia = [...lista];
  const [item] = copia.splice(indiceOrigem, 1);
  copia.splice(indiceDestino, 0, item);
  return copia;
}

// Move o item de `indice` para o início da lista — usado por "Definir como
// capa": a capa é sempre a primeira foto (menor `ordem`), então virar capa é
// virar a primeira posição.
export function moverParaCapa<T>(lista: T[], indice: number): T[] {
  return moverItem(lista, indice, 0);
}

// Fallback de ordenação para fotos antigas sem `ordem` definida: usa a
// posição de chegada (índice no array retornado pelo banco) em vez de deixar
// um valor ausente virar NaN na comparação do sort.
export function ordemComFallback(foto: FotoOrdenavel, indice: number): number {
  return foto.ordem ?? indice;
}

// Ordena fotos pela `ordem` persistida, com o fallback acima para linhas
// antigas sem o campo definido.
export function ordenarFotosPorOrdem<T extends FotoOrdenavel>(fotos: T[]): T[] {
  return fotos
    .map((foto, indice) => ({ foto, chave: ordemComFallback(foto, indice) }))
    .sort((a, b) => a.chave - b.chave)
    .map((item) => item.foto);
}
