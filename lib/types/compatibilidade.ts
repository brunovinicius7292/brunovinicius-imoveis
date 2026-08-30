// Tipagem alinhada à tabela `cliente_imoveis` (radar de compatibilidade —
// ver supabase/migrations/20260830120000_radar_compatibilidade.sql) e ao
// resultado do motor de match em /lib/matching/compatibilidade.ts.

// "automatica": o corretor agiu (favoritar/enviar/ocultar) em cima de uma
// sugestão calculada pelo radar.
// "manual": o corretor adicionou o imóvel diretamente, sem passar pelas
// regras automáticas de compatibilidade.
export type OrigemRelacao = "automatica" | "manual";

// "sugerido" é o estado-base (sugestão ainda sem ação do corretor, ou imóvel
// recém-adicionado manualmente). Os demais são ações explícitas — cada par
// cliente/imóvel tem no máximo uma linha, então os estados são mutuamente
// exclusivos.
export type EstadoRelacao = "sugerido" | "enviado" | "favorito" | "oculto";

export interface ClienteImovelRelacao {
  id: string;
  clienteId: string;
  imovelId: string;
  origem: OrigemRelacao;
  estado: EstadoRelacao;
  criadoEm: string;
  atualizadoEm: string;
}

// Classificação interna do radar, exibida na interface como "Alta", "Média"
// ou "Baixa compatibilidade" — nunca como probabilidade de venda.
export type Classificacao = "alta" | "media" | "baixa";

export interface ResultadoCompatibilidade {
  compativel: boolean; // passou em todos os critérios fortes/mínimos
  classificacao: Classificacao;
  motivos: string[];
}
