"use server";

import { getImoveisPorIds } from "@/lib/supabase/imoveis";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { gerarCodigoSelecao } from "@/lib/utils/codigoSelecao";
import { Imovel } from "@/lib/types/imovel";

export async function buscarImoveisSelecionados(
  ids: string[]
): Promise<Imovel[]> {
  return getImoveisPorIds(ids);
}

const MAX_IMOVEIS_POR_SELECAO = 50;
const MAX_TENTATIVAS_CODIGO = 5;

export interface ResultadoCompartilharSelecao {
  sucesso: boolean;
  codigo?: string;
  erro?: string;
}

// Salva uma cópia imutável da seleção atual no banco, sob um código curto e
// aleatório, para gerar o link público /selecao/<codigo>. Passa pela função
// criar_selecao_compartilhada (security definer, ver migration
// supabase/migrations/20260910120000_selecoes_compartilhadas.sql) — a
// tabela em si fica fechada por RLS, então essa é a única forma de inserir.
// Não mexe no localStorage/seleção local (ver SelecaoProvider.tsx): salvar
// aqui é só uma cópia do estado atual, "Limpar seleção" continua afetando
// somente a lista de trabalho local.
export async function compartilharSelecao(
  imovelIds: string[]
): Promise<ResultadoCompartilharSelecao> {
  if (imovelIds.length === 0) {
    return { sucesso: false, erro: "Sua seleção está vazia." };
  }
  if (imovelIds.length > MAX_IMOVEIS_POR_SELECAO) {
    return {
      sucesso: false,
      erro: `A seleção tem imóveis demais para compartilhar de uma vez (máximo ${MAX_IMOVEIS_POR_SELECAO}).`,
    };
  }

  const supabase = createSupabaseServerClient();

  for (let tentativa = 0; tentativa < MAX_TENTATIVAS_CODIGO; tentativa++) {
    const codigo = gerarCodigoSelecao();

    const { error } = await supabase.rpc("criar_selecao_compartilhada", {
      p_codigo: codigo,
      p_imovel_ids: imovelIds,
    });

    if (!error) {
      return { sucesso: true, codigo };
    }

    // 23505 = unique_violation — colisão de código (extremamente raro).
    // Tenta de novo com outro código; qualquer outro erro já retorna.
    if (error.code !== "23505") {
      return { sucesso: false, erro: error.message };
    }
  }

  return {
    sucesso: false,
    erro: "Não foi possível gerar um link único. Tente novamente.",
  };
}
