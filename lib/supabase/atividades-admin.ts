// Histórico de atividades do cliente (seção "Atividades recentes" da página
// de perfil, /admin/clientes/[id]). O registro em si é chamado de dentro das
// mesmas server actions que já existem para as ações do Radar de
// compatibilidade (favoritar, marcar como enviado, ocultar, adicionar
// manualmente, ofertar no WhatsApp) — ver
// app/(admin)/admin/clientes/compatibilidade-actions.ts — em vez de um
// sistema de tracking separado.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AtividadeCliente, TipoAtividade } from "@/lib/types/atividade";

export interface ResultadoAtividade {
  sucesso: boolean;
  erro?: string;
}

// Insere uma linha no histórico. Falhas aqui não devem derrubar a ação
// principal que a chamou (ex.: favoritar um imóvel não pode falhar só
// porque o registro do histórico deu erro) — por isso as chamadoras não
// propagam o resultado desta função pro usuário, só registram no console.
export async function registrarAtividade(
  clienteId: string,
  tipo: TipoAtividade,
  opcoes?: { imovelId?: string | null; descricao?: string | null }
): Promise<ResultadoAtividade> {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from("cliente_atividades").insert({
    cliente_id: clienteId,
    imovel_id: opcoes?.imovelId ?? null,
    tipo,
    descricao: opcoes?.descricao ?? null,
  });

  if (error) {
    console.error("Erro ao registrar atividade do cliente:", error.message);
    return { sucesso: false, erro: error.message };
  }

  return { sucesso: true };
}

// Histórico completo de um cliente, mais recente primeiro, já com o
// título/slug do imóvel relacionado (quando existir e ainda não tiver sido
// excluído do estoque).
export async function getAtividadesDoCliente(clienteId: string): Promise<AtividadeCliente[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("cliente_atividades")
    .select("id, cliente_id, imovel_id, tipo, descricao, criado_em, imovel:imoveis(id, titulo, slug)")
    .eq("cliente_id", clienteId)
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao buscar atividades do cliente:", error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    clienteId: row.cliente_id,
    imovelId: row.imovel_id ?? undefined,
    tipo: row.tipo as TipoAtividade,
    descricao: row.descricao ?? undefined,
    criadoEm: row.criado_em,
    imovel: row.imovel ?? null,
  }));
}
