"use server";

import { revalidatePath } from "next/cache";
import {
  definirRelacaoClienteImovel,
  ResultadoAcaoRelacao,
} from "@/lib/supabase/compatibilidade-admin";
import { EstadoRelacao } from "@/lib/types/compatibilidade";

function revalidarRadar(clienteId: string, imovelId: string) {
  revalidatePath(`/admin/clientes/${clienteId}/editar`);
  revalidatePath(`/admin/imoveis/${imovelId}/editar`);
}

// Favoritar, marcar como enviado, ocultar para este cliente ou reexibir um
// imóvel ocultado — todas usam o mesmo par cliente/imóvel (unicidade
// garantida pela tabela `cliente_imoveis`), só muda o estado alvo.
export async function definirEstadoImovelCliente(
  clienteId: string,
  imovelId: string,
  estado: EstadoRelacao
): Promise<ResultadoAcaoRelacao> {
  const resultado = await definirRelacaoClienteImovel(clienteId, imovelId, estado, "automatica");
  if (resultado.sucesso) revalidarRadar(clienteId, imovelId);
  return resultado;
}

// Adiciona um imóvel ao cliente mesmo que ele não passe pelas regras
// automáticas de compatibilidade.
export async function adicionarImovelManualmente(
  clienteId: string,
  imovelId: string
): Promise<ResultadoAcaoRelacao> {
  const resultado = await definirRelacaoClienteImovel(clienteId, imovelId, "sugerido", "manual");
  if (resultado.sucesso) revalidarRadar(clienteId, imovelId);
  return resultado;
}
