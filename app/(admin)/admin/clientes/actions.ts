"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  FinalidadeCliente,
  FinanciamentoPreferencia,
  FormaPagamento,
  MomentoComercial,
  QuartosMin,
  Temperatura,
  VagasMin,
} from "@/lib/types/cliente";
import { ROTULOS_MOMENTO } from "@/lib/utils/cliente";
import { registrarAtividade } from "@/lib/supabase/atividades-admin";

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

// Muda a etapa comercial do cliente (Em busca / Em negociação / Negócio
// fechado) — ação independente da edição cadastral, pensada para ser usada
// direto na página de perfil. Registra uma atividade no histórico já
// existente (não cria um segundo sistema de tracking).
export async function alterarMomentoCliente(
  id: string,
  momento: MomentoComercial
): Promise<ResultadoAcaoCliente> {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from("clientes")
    .update({ momento, atualizado_em: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${id}`);
  revalidatePath(`/admin/clientes/${id}/editar`);

  await registrarAtividade(id, "momento_alterado", {
    descricao: `Momento alterado para "${ROTULOS_MOMENTO[momento]}"`,
  });

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
