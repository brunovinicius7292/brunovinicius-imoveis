// Tipagem alinhada à tabela `clientes` (Etapa 6 do painel admin) — cadastro
// enxuto para os clientes com chance real de negócio, sem duplicar dados que
// já existem na tabela `imoveis`. Os dados vêm do Supabase — ver
// /lib/supabase/clientes-admin.ts.

export type Temperatura = "frio" | "morno" | "quente";
export type FormaPagamento = "a_vista" | "financiado" | "indefinido";
export type FinalidadeCliente = "venda" | "aluguel";

// 0 = indiferente (sem mínimo). Os demais valores funcionam como "1+", "2+"
// etc — um imóvel com quantidade maior continua compatível.
export type QuartosMin = 0 | 1 | 2 | 3;
export type VagasMin = 0 | 1 | 2;

export type FinanciamentoPreferencia =
  | "precisa_aceita" // só interessa imóvel que aceita financiamento
  | "nao_aceita" // cliente não vai financiar (irrelevante para o match)
  | "indiferente";

export interface Cliente {
  id: string;
  nome: string;
  whatsapp: string;
  finalidade: FinalidadeCliente;
  /** @deprecated preservado para não quebrar registros antigos — use `interesseTipos`. */
  interesseTipo?: string;
  interesseTipos: string[]; // tipos de imóvel de interesse (casa, apartamento, terreno...), pode ser mais de um
  valorMin?: number;
  valorMax?: number;
  formaPagamento: FormaPagamento;
  quartosMin: QuartosMin;
  vagasMin: VagasMin;
  financiamento: FinanciamentoPreferencia;
  temperatura: Temperatura;
  observacoes?: string;
  criadoEm: string;
}
