"use server";

import { getImoveisPorIds } from "@/lib/supabase/imoveis";
import { Imovel } from "@/lib/types/imovel";

export async function buscarImoveisSelecionados(
  ids: string[]
): Promise<Imovel[]> {
  return getImoveisPorIds(ids);
}
