"use server";

import { revalidatePath } from "next/cache";
import {
  definirRelacaoClienteImovel,
  ResultadoAcaoRelacao,
} from "@/lib/supabase/compatibilidade-admin";
import { registrarAtividade } from "@/lib/supabase/atividades-admin";
import { EstadoRelacao } from "@/lib/types/compatibilidade";
import { TipoAtividade } from "@/lib/types/atividade";

function revalidarRadar(clienteId: string, imovelId: string) {
  revalidatePath(`/admin/clientes/${clienteId}`);
  revalidatePath(`/admin/clientes/${clienteId}/editar`);
  revalidatePath(`/admin/imoveis/${imovelId}/editar`);
}

// Só os estados que devem virar uma entrada no histórico — "sugerido" é o
// estado-base (desfavoritar/desmarcar enviado), que só vira atividade no
// caso específico de reexibir um imóvel ocultado.
function tipoAtividadeParaEstado(
  estadoNovo: EstadoRelacao,
  estadoAnterior: EstadoRelacao | null | undefined
): TipoAtividade | null {
  if (estadoNovo === "favorito") return "favoritado";
  if (estadoNovo === "enviado") return "marcado_enviado";
  if (estadoNovo === "oculto") return "ocultado";
  if (estadoNovo === "sugerido" && estadoAnterior === "oculto") return "reexibido";
  return null;
}

// Favoritar, marcar como enviado, ocultar para este cliente ou reexibir um
// imóvel ocultado — todas usam o mesmo par cliente/imóvel (unicidade
// garantida pela tabela `cliente_imoveis`), só muda o estado alvo. Registra
// a atividade correspondente no histórico do cliente quando fizer sentido.
export async function definirEstadoImovelCliente(
  clienteId: string,
  imovelId: string,
  estado: EstadoRelacao
): Promise<ResultadoAcaoRelacao> {
  const resultado = await definirRelacaoClienteImovel(clienteId, imovelId, estado, "automatica");

  if (resultado.sucesso) {
    revalidarRadar(clienteId, imovelId);

    const tipoAtividade = tipoAtividadeParaEstado(estado, resultado.estadoAnterior);
    if (tipoAtividade) {
      await registrarAtividade(clienteId, tipoAtividade, { imovelId });
    }
  }

  return resultado;
}

// Adiciona um imóvel ao cliente mesmo que ele não passe pelas regras
// automáticas de compatibilidade.
export async function adicionarImovelManualmente(
  clienteId: string,
  imovelId: string
): Promise<ResultadoAcaoRelacao> {
  const resultado = await definirRelacaoClienteImovel(clienteId, imovelId, "sugerido", "manual");

  if (resultado.sucesso) {
    revalidarRadar(clienteId, imovelId);
    await registrarAtividade(clienteId, "adicionado_manual", { imovelId });
  }

  return resultado;
}

// Ação do botão "Ofertar no WhatsApp": marca o imóvel como enviado (mesmo
// efeito de "Marcar como enviado") E registra UMA única atividade
// ("oferta_whatsapp") — não duas — já que enviar a oferta e marcar como
// enviado são o mesmo evento comercial nesse fluxo. É por isso que esta
// ação não reaproveita `definirEstadoImovelCliente` (que registraria
// "marcado_enviado" em vez disso).
export async function ofertarNoWhatsapp(
  clienteId: string,
  imovelId: string
): Promise<ResultadoAcaoRelacao> {
  const resultado = await definirRelacaoClienteImovel(clienteId, imovelId, "enviado", "automatica");

  if (resultado.sucesso) {
    revalidarRadar(clienteId, imovelId);
    await registrarAtividade(clienteId, "oferta_whatsapp", { imovelId });
  }

  return resultado;
}
