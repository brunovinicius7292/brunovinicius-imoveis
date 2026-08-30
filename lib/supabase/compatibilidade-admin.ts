// Dados do radar de compatibilidade (tabela `cliente_imoveis`) e composição
// das listas exibidas nas seções "Imóveis compatíveis" (edição do cliente) e
// "Clientes compatíveis" (edição do imóvel). O cálculo de compatibilidade em
// si é feito em /lib/matching/compatibilidade.ts — aqui só buscamos os dados
// e cruzamos com o resultado do motor.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Cliente } from "@/lib/types/cliente";
import { Imovel } from "@/lib/types/imovel";
import {
  ClienteImovelRelacao,
  EstadoRelacao,
  OrigemRelacao,
  ResultadoCompatibilidade,
} from "@/lib/types/compatibilidade";
import { avaliarCompatibilidade, compararClassificacao } from "@/lib/matching/compatibilidade";
import { getImoveisAdmin } from "@/lib/supabase/imoveis-admin";
import { getClientesAdmin } from "@/lib/supabase/clientes-admin";

function mapRowParaRelacao(row: any): ClienteImovelRelacao {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    imovelId: row.imovel_id,
    origem: row.origem as OrigemRelacao,
    estado: row.estado as EstadoRelacao,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

export async function getRelacoesDoCliente(clienteId: string): Promise<ClienteImovelRelacao[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("cliente_imoveis")
    .select("*")
    .eq("cliente_id", clienteId);

  if (error) {
    console.error("Erro ao buscar relações do cliente:", error.message);
    return [];
  }

  return (data ?? []).map(mapRowParaRelacao);
}

export async function getRelacoesDoImovel(imovelId: string): Promise<ClienteImovelRelacao[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("cliente_imoveis")
    .select("*")
    .eq("imovel_id", imovelId);

  if (error) {
    console.error("Erro ao buscar relações do imóvel:", error.message);
    return [];
  }

  return (data ?? []).map(mapRowParaRelacao);
}

export interface ImovelComRelacao {
  imovel: Imovel;
  resultado: ResultadoCompatibilidade;
  relacao: ClienteImovelRelacao | null;
}

export interface RadarDoCliente {
  sugeridos: ImovelComRelacao[];
  manuais: ImovelComRelacao[];
  ocultos: ImovelComRelacao[];
}

// Monta as três listas exibidas na seção "Imóveis compatíveis" do cliente:
//   - sugeridos: calculados automaticamente pelo radar, sem estar ocultos e
//     sem já estar na lista de manuais (evita duplicar o card).
//   - manuais: adicionados diretamente pelo corretor (origem = "manual"),
//     mesmo que não passem pelas regras automáticas.
//   - ocultos: pares marcados como "ocultar para este cliente" — não entram
//     mais nas sugestões automáticas, mas ficam disponíveis pra reexibir.
export async function getRadarDoCliente(cliente: Cliente): Promise<RadarDoCliente> {
  const [imoveis, relacoes] = await Promise.all([
    getImoveisAdmin(),
    getRelacoesDoCliente(cliente.id),
  ]);

  const relacaoPorImovel = new Map(relacoes.map((relacao) => [relacao.imovelId, relacao]));

  const itens: ImovelComRelacao[] = imoveis.map((imovel) => ({
    imovel,
    resultado: avaliarCompatibilidade(cliente, imovel),
    relacao: relacaoPorImovel.get(imovel.id) ?? null,
  }));

  const ocultos = itens.filter((item) => item.relacao?.estado === "oculto");

  const manuais = itens.filter(
    (item) => item.relacao?.origem === "manual" && item.relacao.estado !== "oculto"
  );
  const idsManuais = new Set(manuais.map((item) => item.imovel.id));

  const sugeridos = itens
    .filter(
      (item) =>
        item.resultado.compativel &&
        item.relacao?.estado !== "oculto" &&
        !idsManuais.has(item.imovel.id)
    )
    .sort((a, b) => compararClassificacao(a.resultado.classificacao, b.resultado.classificacao));

  return { sugeridos, manuais, ocultos };
}

export interface ClienteComRelacao {
  cliente: Cliente;
  resultado: ResultadoCompatibilidade;
  relacao: ClienteImovelRelacao | null;
}

// Lista exibida na seção "Clientes compatíveis" do imóvel: clientes cujo
// perfil bate com o imóvel pelo radar, mais os que foram ligados manualmente
// a partir da tela do cliente — exceto os pares ocultados.
export async function getClientesCompativeis(imovel: Imovel): Promise<ClienteComRelacao[]> {
  const [clientes, relacoes] = await Promise.all([
    getClientesAdmin(),
    getRelacoesDoImovel(imovel.id),
  ]);

  const relacaoPorCliente = new Map(relacoes.map((relacao) => [relacao.clienteId, relacao]));

  return clientes
    .map((cliente) => ({
      cliente,
      resultado: avaliarCompatibilidade(cliente, imovel),
      relacao: relacaoPorCliente.get(cliente.id) ?? null,
    }))
    .filter(
      (item) =>
        item.relacao?.estado !== "oculto" &&
        (item.resultado.compativel || item.relacao?.origem === "manual")
    )
    .sort((a, b) => compararClassificacao(a.resultado.classificacao, b.resultado.classificacao));
}

export interface ResultadoAcaoRelacao {
  sucesso: boolean;
  erro?: string;
  // Estado do par antes desta chamada (null se o par ainda não existia) —
  // usada pelas server actions em compatibilidade-actions.ts pra decidir
  // qual atividade registrar no histórico (ex.: só é "reexibido" se o
  // estado anterior era "oculto"), sem precisar de uma consulta extra.
  estadoAnterior?: EstadoRelacao | null;
}

// Cria ou atualiza o par cliente/imóvel com o estado informado — usada tanto
// pelas ações de favoritar/marcar como enviado/ocultar/reexibir (origem
// "automatica", a menos que o par já exista como manual) quanto pela adição
// manual (origem "manual", estado inicial "sugerido").
export async function definirRelacaoClienteImovel(
  clienteId: string,
  imovelId: string,
  estado: EstadoRelacao,
  origem: OrigemRelacao
): Promise<ResultadoAcaoRelacao> {
  const supabase = createSupabaseServerClient();

  const { data: existente, error: erroBusca } = await supabase
    .from("cliente_imoveis")
    .select("id, origem, estado")
    .eq("cliente_id", clienteId)
    .eq("imovel_id", imovelId)
    .maybeSingle();

  if (erroBusca) {
    return { sucesso: false, erro: erroBusca.message };
  }

  const estadoAnterior = (existente?.estado as EstadoRelacao | undefined) ?? null;

  if (existente) {
    const { error } = await supabase
      .from("cliente_imoveis")
      .update({
        estado,
        // Uma vez manual, continua manual — a não ser que a própria adição
        // manual esteja reforçando isso (redundante, mas inofensivo).
        origem: existente.origem === "manual" ? "manual" : origem,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", existente.id);

    if (error) return { sucesso: false, erro: error.message };
    return { sucesso: true, estadoAnterior };
  }

  const { error } = await supabase
    .from("cliente_imoveis")
    .insert({ cliente_id: clienteId, imovel_id: imovelId, origem, estado });

  if (error) return { sucesso: false, erro: error.message };
  return { sucesso: true, estadoAnterior };
}
