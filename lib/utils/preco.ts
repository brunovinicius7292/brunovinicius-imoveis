export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export const ROTULOS_FINALIDADE: Record<string, string> = {
  venda: "Venda",
  aluguel: "Aluguel",
  venda_aluguel: "Venda e Aluguel",
};
