"use client";

import { useMemo, useState } from "react";
import { Finalidade, Imovel } from "@/lib/types/imovel";
import { chaveNormalizada, capitalizarPalavras } from "@/lib/utils/texto";
import { formatarMoeda, ROTULOS_FINALIDADE } from "@/lib/utils/preco";
import { Campo, classesInput } from "@/components/ui/CampoFormulario";
import TabelaImoveis from "@/components/admin/TabelaImoveis";

type FiltroPublicado = "" | "sim" | "nao";

interface Opcao {
  chave: string;
  rotulo: string;
}

interface Faixa {
  min: number;
  max: number;
}

// Valores distintos (ignorando maiúsculas/espaços) já cadastrados nos imóveis
// carregados, mesma normalização usada nas sugestões do formulário.
function opcoesUnicas(valores: (string | null | undefined)[]): Opcao[] {
  const mapa = new Map<string, string>();

  for (const valor of valores) {
    if (!valor) continue;
    const chave = chaveNormalizada(valor);
    if (!mapa.has(chave)) {
      mapa.set(chave, capitalizarPalavras(valor));
    }
  }

  return Array.from(mapa.entries())
    .map(([chave, rotulo]) => ({ chave, rotulo }))
    .sort((a, b) => a.rotulo.localeCompare(b.rotulo, "pt-BR"));
}

// Gera faixas de preço de largura `passo`, cobrindo do menor ao maior valor
// cadastrado em intervalos fechados, e sempre acrescenta uma faixa aberta
// final ("X ou mais") a partir do próximo múltiplo da régua acima do maior
// valor — essa última faixa só filtra o que o próprio rótulo promete.
// Usada apenas para Aluguel (Venda usa a régua fixa abaixo).
function gerarFaixas(valores: number[], passo: number): Faixa[] {
  if (valores.length === 0) return [];

  const menor = Math.min(...valores);
  const maior = Math.max(...valores);

  const inicio = Math.floor(menor / passo) * passo;
  const topo = Math.ceil(maior / passo) * passo;

  const faixas: Faixa[] = [];
  for (let atual = inicio; atual < topo; atual += passo) {
    faixas.push({ min: atual, max: atual + passo });
  }
  faixas.push({ min: topo, max: Infinity });

  return faixas;
}

// Régua fixa de Venda: R$100 mil em R$100 mil até R$1 milhão, depois R$500
// mil em R$500 mil até R$2 milhões, sempre terminando em "R$2.000.000 ou
// mais" — independente dos imóveis cadastrados.
function gerarFaixasVenda(): Faixa[] {
  const faixas: Faixa[] = [];

  for (let atual = 0; atual < 1000000; atual += 100000) {
    faixas.push({ min: atual, max: atual + 100000 });
  }
  for (let atual = 1000000; atual < 2000000; atual += 500000) {
    faixas.push({ min: atual, max: atual + 500000 });
  }
  faixas.push({ min: 2000000, max: Infinity });

  return faixas;
}

function codificarFaixa(faixa: Faixa) {
  return Number.isFinite(faixa.max) ? `${faixa.min}-${faixa.max}` : `${faixa.min}-mais`;
}

// Valor do imóvel relevante para a finalidade filtrada: para "venda", tanto
// imóveis de venda quanto os "venda e aluguel" usam o campo `preco`; para
// "aluguel", imóveis de aluguel usam `preco` e os "venda e aluguel" usam
// `precoAluguel`. Retorna undefined quando o imóvel não se aplica.
function valorParaFinalidade(
  imovel: Imovel,
  alvo: "venda" | "aluguel"
): number | undefined {
  if (alvo === "venda") {
    if (imovel.finalidade === "venda" || imovel.finalidade === "venda_aluguel") {
      return imovel.preco;
    }
    return undefined;
  }

  if (imovel.finalidade === "aluguel") return imovel.preco;
  if (imovel.finalidade === "venda_aluguel") return imovel.precoAluguel;
  return undefined;
}

export default function FiltrosImoveis({ imoveis }: { imoveis: Imovel[] }) {
  const [finalidade, setFinalidade] = useState<Finalidade | "">("");
  const [tipo, setTipo] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [publicado, setPublicado] = useState<FiltroPublicado>("");
  const [faixaPreco, setFaixaPreco] = useState("");

  const tipos = useMemo(() => opcoesUnicas(imoveis.map((i) => i.tipo)), [imoveis]);
  const cidades = useMemo(() => opcoesUnicas(imoveis.map((i) => i.cidade)), [imoveis]);
  const bairros = useMemo(() => opcoesUnicas(imoveis.map((i) => i.bairro)), [imoveis]);

  const passoFaixa =
    finalidade === "venda" ? 100000 : finalidade === "aluguel" ? 1000 : null;

  const faixas = useMemo(() => {
    if (finalidade === "venda") return gerarFaixasVenda();

    if (finalidade === "aluguel") {
      const valores = imoveis
        .map((imovel) => valorParaFinalidade(imovel, "aluguel"))
        .filter((valor): valor is number => typeof valor === "number" && !Number.isNaN(valor));
      return gerarFaixas(valores, 1000);
    }

    return [];
  }, [imoveis, finalidade]);

  function handleFinalidadeChange(valor: string) {
    setFinalidade(valor as Finalidade | "");
    setFaixaPreco("");
  }

  const imoveisFiltrados = useMemo(() => {
    return imoveis.filter((imovel) => {
      if (finalidade === "venda" || finalidade === "aluguel") {
        const aplicavel =
          imovel.finalidade === finalidade || imovel.finalidade === "venda_aluguel";
        if (!aplicavel) return false;
      } else if (finalidade && imovel.finalidade !== finalidade) {
        return false;
      }

      if (tipo && chaveNormalizada(imovel.tipo) !== tipo) return false;
      if (cidade && chaveNormalizada(imovel.cidade) !== cidade) return false;
      if (bairro && chaveNormalizada(imovel.bairro) !== bairro) return false;
      if (publicado === "sim" && !imovel.publicado) return false;
      if (publicado === "nao" && imovel.publicado) return false;

      if (faixaPreco && (finalidade === "venda" || finalidade === "aluguel")) {
        const valor = valorParaFinalidade(imovel, finalidade);
        if (valor === undefined) return false;

        const [minTexto, maxTexto] = faixaPreco.split("-");
        const min = Number(minTexto);
        if (maxTexto === "mais") {
          if (valor < min) return false;
        } else {
          const max = Number(maxTexto);
          if (valor < min || valor >= max) return false;
        }
      }

      return true;
    });
  }, [imoveis, finalidade, tipo, cidade, bairro, publicado, faixaPreco]);

  function limparFiltros() {
    setFinalidade("");
    setTipo("");
    setCidade("");
    setBairro("");
    setPublicado("");
    setFaixaPreco("");
  }

  const filtrosAtivos =
    finalidade !== "" ||
    tipo !== "" ||
    cidade !== "" ||
    bairro !== "" ||
    publicado !== "" ||
    faixaPreco !== "";

  const semResultado = imoveis.length > 0 && imoveisFiltrados.length === 0;

  return (
    <div>
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-900/5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Campo label="Finalidade">
            <select
              value={finalidade}
              onChange={(e) => handleFinalidadeChange(e.target.value)}
              className={classesInput}
            >
              <option value="">Todas</option>
              <option value="venda">{ROTULOS_FINALIDADE.venda}</option>
              <option value="aluguel">{ROTULOS_FINALIDADE.aluguel}</option>
              <option value="venda_aluguel">
                {ROTULOS_FINALIDADE.venda_aluguel}
              </option>
            </select>
          </Campo>

          <Campo label="Categoria">
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className={classesInput}
            >
              <option value="">Todas</option>
              {tipos.map((opcao) => (
                <option key={opcao.chave} value={opcao.chave}>
                  {opcao.rotulo}
                </option>
              ))}
            </select>
          </Campo>

          <Campo label="Cidade">
            <select
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className={classesInput}
            >
              <option value="">Todas</option>
              {cidades.map((opcao) => (
                <option key={opcao.chave} value={opcao.chave}>
                  {opcao.rotulo}
                </option>
              ))}
            </select>
          </Campo>

          <Campo label="Bairro">
            <select
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              className={classesInput}
            >
              <option value="">Todos</option>
              {bairros.map((opcao) => (
                <option key={opcao.chave} value={opcao.chave}>
                  {opcao.rotulo}
                </option>
              ))}
            </select>
          </Campo>

          <Campo label="Publicado">
            <select
              value={publicado}
              onChange={(e) => setPublicado(e.target.value as FiltroPublicado)}
              className={classesInput}
            >
              <option value="">Todos</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </Campo>

          <Campo label="Faixa de preço">
            <select
              value={faixaPreco}
              onChange={(e) => setFaixaPreco(e.target.value)}
              disabled={!passoFaixa}
              className={`${classesInput} disabled:cursor-not-allowed disabled:bg-navy-50 disabled:text-navy-300`}
            >
              <option value="">
                {passoFaixa
                  ? "Todas as faixas"
                  : "Selecione Venda ou Aluguel"}
              </option>
              {faixas.map((faixa) => {
                const aberta = !Number.isFinite(faixa.max);
                const valor = codificarFaixa(faixa);
                return (
                  <option key={valor} value={valor}>
                    {aberta
                      ? `${formatarMoeda(faixa.min)} ou mais`
                      : `${formatarMoeda(faixa.min)} – ${formatarMoeda(faixa.max)}`}
                  </option>
                );
              })}
            </select>
          </Campo>
        </div>

        {filtrosAtivos && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={limparFiltros}
              className="font-body text-sm font-medium text-navy-500 hover:text-navy-700"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      <p className="mb-3 font-body text-sm text-navy-500">
        {imoveisFiltrados.length} de {imoveis.length} imóveis
      </p>

      {semResultado ? (
        <div className="rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
          <p className="font-body text-sm text-navy-400">
            Nenhum imóvel encontrado com os filtros selecionados.
          </p>
        </div>
      ) : (
        <TabelaImoveis imoveis={imoveisFiltrados} />
      )}
    </div>
  );
}
