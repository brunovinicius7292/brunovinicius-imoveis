// Motor do radar de compatibilidade entre clientes e imóveis — cálculo 100%
// local (sem IA externa), usado tanto na edição do cliente ("Imóveis
// compatíveis") quanto na edição do imóvel ("Clientes compatíveis").
//
// Regras de negócio (não repetir/alterar sem revisar a tarefa original):
//   - Só imóveis com status "disponivel" entram no radar.
//   - Finalidade precisa ser compatível (venda/aluguel), usando `preco` para
//     venda e `preco_aluguel` para aluguel — mesma regra de
//     lib/utils/preco.ts#valorParaFinalidade, reaproveitada aqui.
//   - Critérios fortes (bloqueiam se não baterem): tipo do imóvel, valor
//     máximo do cliente e financiamento.
//   - Critérios de mínimo (bloqueiam se o imóvel tiver menos, mas um valor
//     maior continua compatível): quartos e vagas.
//   - Bairro, valor de entrada, parcela máxima, urgência, motivação de
//     compra, observações e andar NÃO entram no cálculo nesta versão.
//   - O resultado é uma classificação interna (Alta/Média/Baixa
//     compatibilidade) — nunca chamada de "probabilidade de venda".

import { Cliente } from "@/lib/types/cliente";
import { Imovel } from "@/lib/types/imovel";
import { Classificacao, ResultadoCompatibilidade } from "@/lib/types/compatibilidade";
import { formatarMoeda, valorParaFinalidade } from "@/lib/utils/preco";
import { capitalizarPalavras, chaveNormalizada } from "@/lib/utils/texto";

export const ROTULOS_CLASSIFICACAO: Record<Classificacao, string> = {
  alta: "Alta compatibilidade",
  media: "Média compatibilidade",
  baixa: "Baixa compatibilidade",
};

const RESULTADO_INCOMPATIVEL: ResultadoCompatibilidade = {
  compativel: false,
  classificacao: "baixa",
  motivos: [],
};

function plural(quantidade: number, singular: string, plural: string) {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}

// Avalia um par cliente/imóvel e devolve se são compatíveis, a classificação
// (só relevante quando `compativel` é true) e os motivos legíveis da
// sugestão — ex.: ["Apartamento", "financiável", "até R$ 230.000", "2
// quartos e 1 vaga"].
export function avaliarCompatibilidade(
  cliente: Cliente,
  imovel: Imovel
): ResultadoCompatibilidade {
  if (imovel.status !== "disponivel") return RESULTADO_INCOMPATIVEL;

  const valorReferencia = valorParaFinalidade(imovel, cliente.finalidade);
  if (valorReferencia == null) return RESULTADO_INCOMPATIVEL;

  const interesseTipos = cliente.interesseTipos ?? [];
  const tipoCompativel =
    interesseTipos.length === 0 ||
    interesseTipos.some(
      (tipo) => chaveNormalizada(tipo) === chaveNormalizada(imovel.tipo)
    );
  if (!tipoCompativel) return RESULTADO_INCOMPATIVEL;

  if (cliente.valorMax != null && valorReferencia > cliente.valorMax) {
    return RESULTADO_INCOMPATIVEL;
  }

  if (cliente.financiamento === "precisa_aceita" && !imovel.aceitaFinanciamento) {
    return RESULTADO_INCOMPATIVEL;
  }

  if (cliente.quartosMin > 0 && imovel.quartos < cliente.quartosMin) {
    return RESULTADO_INCOMPATIVEL;
  }

  if (cliente.vagasMin > 0 && imovel.vagas < cliente.vagasMin) {
    return RESULTADO_INCOMPATIVEL;
  }

  // A partir daqui o par já é compatível — a pontuação abaixo só decide o
  // nível (Alta/Média/Baixa), somando até 2 pontos por critério (valor,
  // financiamento, quartos, vagas), com mínimo de 1 ponto quando o critério
  // é neutro (ex.: cliente não definiu valor máximo).
  let pontos = 0;

  if (cliente.valorMax != null) {
    const proporcaoDoOrcamento = valorReferencia / cliente.valorMax;
    pontos += proporcaoDoOrcamento <= 0.85 ? 2 : 1;
  } else {
    pontos += 1;
  }

  if (cliente.financiamento === "precisa_aceita") {
    pontos += 2;
  } else if (cliente.financiamento === "indiferente" && imovel.aceitaFinanciamento) {
    pontos += 2;
  } else {
    pontos += 1;
  }

  if (cliente.quartosMin > 0) {
    pontos += imovel.quartos > cliente.quartosMin ? 2 : 1;
  } else {
    pontos += 1;
  }

  if (cliente.vagasMin > 0) {
    pontos += imovel.vagas > cliente.vagasMin ? 2 : 1;
  } else {
    pontos += 1;
  }

  const proporcao = pontos / 8;
  const classificacao: Classificacao =
    proporcao >= 0.8 ? "alta" : proporcao >= 0.6 ? "media" : "baixa";

  const motivos = [
    capitalizarPalavras(imovel.tipo),
    imovel.aceitaFinanciamento ? "financiável" : null,
    `até ${formatarMoeda(valorReferencia)}`,
    `${plural(imovel.quartos, "quarto", "quartos")} e ${plural(imovel.vagas, "vaga", "vagas")}`,
  ].filter((motivo): motivo is string => Boolean(motivo));

  return { compativel: true, classificacao, motivos };
}

const ORDEM_CLASSIFICACAO: Record<Classificacao, number> = {
  alta: 0,
  media: 1,
  baixa: 2,
};

// Comparador (Alta > Média > Baixa) para usar em Array#sort — reaproveitado
// tanto para listas de imóveis quanto de clientes.
export function compararClassificacao(a: Classificacao, b: Classificacao): number {
  return ORDEM_CLASSIFICACAO[a] - ORDEM_CLASSIFICACAO[b];
}

// Ordena por classificação (Alta > Média > Baixa), mantendo a ordem relativa
// original dentro de cada nível (sort estável).
export function ordenarPorClassificacao<T extends { classificacao: Classificacao }>(
  itens: T[]
): T[] {
  return [...itens].sort((a, b) => compararClassificacao(a.classificacao, b.classificacao));
}
