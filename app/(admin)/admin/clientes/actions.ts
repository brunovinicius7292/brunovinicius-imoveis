"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  FinalidadeCliente,
  FinanciamentoPreferencia,
  FormaPagamento,
  QuartosMin,
  Temperatura,
  VagasMin,
} from "@/lib/types/cliente";

export interface ClienteFormDados {
  nome: string;
  whatsapp: string;
  finalidade: FinalidadeCliente;
  interesseTipos: string[];
  valorMin: number | null;
  valorMax: number | null;
  formaPagamento: FormaPagamento;
  quartosMin: QuartosMin;
  vagasMin: VagasMin;
  financiamento: FinanciamentoPreferencia;
  temperatura: Temperatura;
  observacoes: string;
}

export interface ResultadoAcaoCliente {
  sucesso: boolean;
  erro?: string;
  id?: string;
}

export async function criarCliente(
  dados: ClienteFormDados
): Promise<ResultadoAcaoCliente> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("clientes")
    .insert({
      nome: dados.nome,
      whatsapp: dados.whatsapp,
      finalidade: dados.finalidade,
      interesse_tipos: dados.interesseTipos,
      valor_min: dados.valorMin,
      valor_max: dados.valorMax,
      forma_pagamento: dados.formaPagamento,
      quartos_min: dados.quartosMin,
      vagas_min: dados.vagasMin,
      financiamento: dados.financiamento,
      temperatura: dados.temperatura,
      observacoes: dados.observacoes || null,
    })
    .select("id")
    .single();

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/admin/clientes");
  return { sucesso: true, id: data.id };
}

export async function atualizarCliente(
  id: string,
  dados: ClienteFormDados
): Promise<ResultadoAcaoCliente> {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from("clientes")
    .update({
      nome: dados.nome,
      whatsapp: dados.whatsapp,
      finalidade: dados.finalidade,
      interesse_tipos: dados.interesseTipos,
      valor_min: dados.valorMin,
      valor_max: dados.valorMax,
      forma_pagamento: dados.formaPagamento,
      quartos_min: dados.quartosMin,
      vagas_min: dados.vagasMin,
      financiamento: dados.financiamento,
      temperatura: dados.temperatura,
      observacoes: dados.observacoes || null,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/admin/clientes");
  return { sucesso: true };
}

export async function excluirCliente(id: string): Promise<ResultadoAcaoCliente> {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from("clientes").delete().eq("id", id);

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/admin/clientes");
  return { sucesso: true };
}
