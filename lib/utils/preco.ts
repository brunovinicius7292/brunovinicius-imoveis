import { Imovel } from "@/lib/types/imovel";

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

// Valor do imóvel relevante para a finalidade filtrada: para "venda", tanto
// imóveis de venda quanto os "venda e aluguel" usam o campo `preco`; para
// "aluguel", imóveis de aluguel usam `preco` e os "venda e aluguel" usam
// `precoAluguel`. Retorna undefined quando o imóvel não se aplica.
// Usada tanto pelo painel admin (components/admin/FiltrosImoveis.tsx) quanto
// pelo site público (lib/supabase/imoveis.ts), para que os dois apliquem
// exatamente a mesma regra.
export function valorParaFinalidade(
  imovel: Imovel,
  alvo: "venda" | "aluguel"
): number | undefined {
  if (alvo === "venda") {
    if (imovel.finalidade === "venda" || imovel.finalidade === "venda_aluguel") {
      return imovel.preco;
    }
    return undefined;
  }

  if (imovel.finalidade === "aluguel") return imovel.preco;
  if (imovel.finalidade === "venda_aluguel") return imovel.precoAluguel;
  return undefined;
}
