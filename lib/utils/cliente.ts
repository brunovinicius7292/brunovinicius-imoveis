// Rótulos e classes de exibição para os campos do cliente — compartilhados
// entre a tabela do painel (TabelaClientes.tsx) e a página de perfil
// (/admin/clientes/[id]), pra não duplicar esses mapeamentos.

import {
  Cliente,
  FinalidadeCliente,
  FinanciamentoPreferencia,
  FormaPagamento,
  Temperatura,
} from "@/lib/types/cliente";
import { formatarMoeda } from "@/lib/utils/preco";

export const CLASSES_TEMPERATURA: Record<Temperatura, string> = {
  quente: "bg-red-100 text-red-700",
  morno: "bg-amber-100 text-amber-700",
  frio: "bg-blue-100 text-blue-700",
};

export const ROTULOS_TEMPERATURA: Record<Temperatura, string> = {
  quente: "Quente",
  morno: "Morno",
  frio: "Frio",
};

export const ROTULOS_PAGAMENTO: Record<FormaPagamento, string> = {
  a_vista: "À vista",
  financiado: "Financiado",
  indefinido: "Indefinido",
};

export const ROTULOS_FINALIDADE_CLIENTE: Record<FinalidadeCliente, string> = {
  venda: "Venda",
  aluguel: "Aluguel",
};

export const CLASSES_FINALIDADE_CLIENTE: Record<FinalidadeCliente, string> = {
  venda: "bg-green-100 text-green-700",
  aluguel: "bg-blue-100 text-blue-700",
};

export const ROTULOS_FINANCIAMENTO: Record<FinanciamentoPreferencia, string> = {
  precisa_aceita: "Precisa aceitar financiamento",
  nao_aceita: "Não aceita financiamento",
  indiferente: "Indiferente",
};

// "Até R$X", "A partir de R$X", "R$X – R$Y" ou "—" quando nenhum dos dois
// foi informado.
export function formatarFaixaValor(cliente: Pick<Cliente, "valorMin" | "valorMax">) {
  if (cliente.valorMin != null && cliente.valorMax != null) {
    return `${formatarMoeda(cliente.valorMin)} – ${formatarMoeda(cliente.valorMax)}`;
  }
  if (cliente.valorMin != null) {
    return `A partir de ${formatarMoeda(cliente.valorMin)}`;
  }
  if (cliente.valorMax != null) {
    return `Até ${formatarMoeda(cliente.valorMax)}`;
  }
  return "—";
}

// "Indiferente", "1+", "2+"...
export function formatarMinimo(valor: number) {
  return valor > 0 ? `${valor}+` : "Indiferente";
}
