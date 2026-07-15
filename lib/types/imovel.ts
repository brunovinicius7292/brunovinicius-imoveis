// Tipagem alinhada à tabela `imoveis` (Seção 6 do PROJECT.md, com o adicional
// de `codigo` e `publicado` autorizado e migrado na Etapa 3 do painel admin).
// Os dados vêm do Supabase — ver /lib/supabase/imoveis.ts (site público) e
// /lib/supabase/imoveis-admin.ts (painel administrativo).

export type Finalidade = "venda" | "aluguel";
export type StatusImovel = "disponivel" | "vendido" | "alugado";

export interface Imovel {
  id: string;
  codigo?: string;
  titulo: string;
  descricao?: string;
  tipo: string; // casa, apartamento, terreno, sala comercial...
  finalidade: Finalidade;
  preco: number;
  condominio?: number;
  iptu?: number;
  aceitaFinanciamento?: boolean;
  aceitaFgts?: boolean;
  cidade: string;
  bairro: string;
  quartos: number;
  banheiros: number;
  vagas: number;
  areaM2: number;
  fotoCapaUrl: string;
  videoYoutubeUrl?: string;
  destaque?: boolean;
  publicado?: boolean;
  status: StatusImovel;
  slug: string;
}
