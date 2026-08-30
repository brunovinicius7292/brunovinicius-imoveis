import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  Cliente,
  FinalidadeCliente,
  FinanciamentoPreferencia,
  FormaPagamento,
  QuartosMin,
  Temperatura,
  VagasMin,
} from "@/lib/types/cliente";
import { capitalizarPalavras, chaveNormalizada } from "@/lib/utils/texto";

function mapRowParaCliente(row: any): Cliente {
  return {
    id: row.id,
    nome: row.nome,
    whatsapp: row.whatsapp,
    finalidade: (row.finalidade as FinalidadeCliente) ?? "venda",
    interesseTipo: row.interesse_tipo ?? undefined,
    interesseTipos: (row.interesse_tipos as string[] | null) ?? [],
    valorMin: row.valor_min != null ? Number(row.valor_min) : undefined,
    valorMax: row.valor_max != null ? Number(row.valor_max) : undefined,
    formaPagamento: (row.forma_pagamento as FormaPagamento) ?? "indefinido",
    quartosMin: (row.quartos_min as QuartosMin) ?? 0,
    vagasMin: (row.vagas_min as VagasMin) ?? 0,
    financiamento: (row.financiamento as FinanciamentoPreferencia) ?? "indiferente",
    temperatura: row.temperatura as Temperatura,
    observacoes: row.observacoes ?? undefined,
    criadoEm: row.criado_em,
  };
}

// Ordem de urgência para listar os clientes mais quentes primeiro.
const ORDEM_TEMPERATURA: Record<Temperatura, number> = {
  quente: 0,
  morno: 1,
  frio: 2,
};

// Todos os clientes cadastrados, para a tabela do painel — ordenados pela
// temperatura (quente > morno > frio) e, dentro de cada uma, pelo mais
// recente primeiro, para que o cliente mais urgente sempre apareça no topo.
export async function getClientesAdmin(): Promise<Cliente[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao buscar clientes (admin):", error.message);
    return [];
  }

  const clientes = (data ?? []).map(mapRowParaCliente);
  return clientes.sort(
    (a, b) => ORDEM_TEMPERATURA[a.temperatura] - ORDEM_TEMPERATURA[b.temperatura]
  );
}

// Um cliente pelo id, para a tela de edição do painel.
export async function getClientePorId(id: string): Promise<Cliente | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar cliente pelo id:", error.message);
    return null;
  }

  return data ? mapRowParaCliente(data) : null;
}

// Sugestões (checkboxes) para o campo "Tipos de imóvel de interesse" do
// formulário — reaproveita tanto os tipos já usados nos imóveis cadastrados
// quanto os já usados em outros clientes, para que o corretor sempre veja os
// tipos mais comuns primeiro. O cliente ainda pode digitar um tipo novo que
// não esteja na lista.
export async function getSugestoesInteresse(): Promise<string[]> {
  const supabase = createSupabaseServerClient();

  const [imoveisResp, clientesResp] = await Promise.all([
    supabase.from("imoveis").select("tipo"),
    supabase.from("clientes").select("interesse_tipos"),
  ]);

  if (imoveisResp.error) {
    console.error("Erro ao buscar tipos de imóveis:", imoveisResp.error.message);
  }
  if (clientesResp.error) {
    console.error(
      "Erro ao buscar interesses de clientes:",
      clientesResp.error.message
    );
  }

  const valores = [
    ...(imoveisResp.data ?? []).map((linha) => linha.tipo),
    ...(clientesResp.data ?? []).flatMap(
      (linha) => (linha.interesse_tipos as string[] | null) ?? []
    ),
  ];

  const mapa = new Map<string, string>();
  for (const valor of valores) {
    if (!valor) continue;
    const chave = chaveNormalizada(valor);
    if (!mapa.has(chave)) {
      mapa.set(chave, capitalizarPalavras(valor));
    }
  }

  return Array.from(mapa.values()).sort((a, b) => a.localeCompare(b, "pt-BR"));
}
