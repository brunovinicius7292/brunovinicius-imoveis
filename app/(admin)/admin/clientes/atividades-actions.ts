"use server";

import { revalidatePath } from "next/cache";
import { registrarAtividade, ResultadoAtividade } from "@/lib/supabase/atividades-admin";

// Nota manual curta digitada pelo corretor na página de perfil do cliente
// (ex.: "Ligação realizada", "Visita agendada") — não tem imóvel
// relacionado.
export async function adicionarNotaManual(
  clienteId: string,
  descricao: string
): Promise<ResultadoAtividade> {
  const texto = descricao.trim();
  if (!texto) {
    return { sucesso: false, erro: "Escreva uma nota antes de salvar." };
  }

  const resultado = await registrarAtividade(clienteId, "nota_manual", { descricao: texto });

  if (resultado.sucesso) {
    revalidatePath(`/admin/clientes/${clienteId}`);
  }

  return resultado;
}
