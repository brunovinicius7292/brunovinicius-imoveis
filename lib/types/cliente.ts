// Tipagem alinhada à tabela `clientes` (Etapa 6 do painel admin) — cadastro
// enxuto para os clientes com chance real de negócio, sem duplicar dados que
// já existem na tabela `imoveis`. Os dados vêm do Supabase — ver
// /lib/supabase/clientes-admin.ts.

export type Temperatura = "frio" | "morno" | "quente";
export type FormaPagamento = "a_vista" | "financiado" | "indefinido";
export type FinalidadeCliente = "venda" | "aluguel";

export interface Cliente {
  id: string;
  nome: string;
  whatsapp: string;
  finalidade: FinalidadeCliente;
  interesseTipo?: string; // tipo de imóvel de interesse (casa, apartamento, terreno...)
  valorMin?: number;
  valorMax?: number;
  formaPagamento: FormaPagamento;
  temperatura: Temperatura;
  observacoes?: string;
  criadoEm: string;
}
