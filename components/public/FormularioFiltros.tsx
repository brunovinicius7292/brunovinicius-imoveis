"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OpcaoBairro, OpcaoLocalidade } from "@/lib/supabase/imoveis";

// Mesma altura, padding e tipografia em todos os campos (selects e inputs),
// para o alinhamento ficar perfeito independentemente do tipo de campo.
const classesCampoBase =
  "w-full rounded-lg border border-navy-200 bg-white px-3 font-body text-sm text-navy-800 transition focus:border-gold-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-navy-50 disabled:text-navy-300";

const OPCOES_QUARTOS = ["1", "2", "3", "4", "5"];
const OPCOES_VAGAS = ["1", "2", "3", "4"];

// Valor "" representa "Ambos" — mesma convenção usada pelos demais filtros
// (ausência de valor = sem restrição na busca).
const OPCOES_FINALIDADE: { label: string; value: string }[] = [
  { label: "Ambos", value: "" },
  { label: "Venda", value: "venda" },
  { label: "Aluguel", value: "aluguel" },
  { label: "Venda e Aluguel", value: "venda_aluguel" },
];

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const OPCOES_ORDENACAO = [
  { label: "Mais recentes", value: "" },
  { label: "Menor preço", value: "menor-preco" },
  { label: "Maior preço", value: "maior-preco" },
  { label: "Maior área", value: "maior-area" },
];

interface FiltrosForm {
  cidade: string;
  bairro: string;
  categoria: string;
  finalidade: string;
  precoMax: string;
  quartos: string;
  vagas: string;
  ordenar: string;
}

function lerFiltrosDaUrl(searchParams: URLSearchParams): FiltrosForm {
  return {
    cidade: searchParams.get("cidade") ?? "",
    bairro: searchParams.get("bairro") ?? "",
    categoria: searchParams.get("categoria") ?? "",
    finalidade: searchParams.get("finalidade") ?? "",
    precoMax: searchParams.get("precoMax") ?? "",
    quartos: searchParams.get("quartos") ?? "",
    vagas: searchParams.get("vagas") ?? "",
    ordenar: searchParams.get("ordenar") ?? "",
  };
}

export default function FormularioFiltros({
  categorias,
  cidades,
  bairros,
}: {
  categorias: string[];
  cidades: OpcaoLocalidade[];
  bairros: OpcaoBairro[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filtros, setFiltros] = useState<FiltrosForm>(() =>
    lerFiltrosDaUrl(searchParams)
  );

  // Mantém o formulário sincronizado com a URL — inclusive quando ela muda
  // por outro caminho (ex.: o botão "Limpar filtros" da tela de sem
  // resultados), garantindo que os campos sempre reflitam o que está na URL.
  useEffect(() => {
    setFiltros(lerFiltrosDaUrl(searchParams));
  }, [searchParams]);

  // Ao selecionar uma cidade, mostra só os bairros daquela cidade.
  const bairrosDisponiveis = useMemo(() => {
    if (!filtros.cidade) return [];
    return bairros.filter((bairro) => bairro.cidade === filtros.cidade);
  }, [bairros, filtros.cidade]);

  function atualizarCampo<K extends keyof FiltrosForm>(
    campo: K,
    valor: string
  ) {
    setFiltros((atual) => {
      if (campo === "cidade") {
        // Trocar (ou limpar) a cidade invalida o bairro selecionado antes.
        return { ...atual, cidade: valor, bairro: "" };
      }
      return { ...atual, [campo]: valor };
    });
  }

  function handleSubmit(evento: FormEvent) {
    evento.preventDefault();

    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([chave, valor]) => {
      if (valor) params.set(chave, valor);
    });

    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : "/");
  }

  const classesCampo = `${classesCampoBase} h-11`;

  function classesSelect(valor: string) {
    return `${classesCampo} ${valor ? "text-navy-800" : "text-navy-400"}`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl bg-white p-5 shadow-lg shadow-navy-900/10 sm:p-6"
    >
      <div
        role="tablist"
        aria-label="Finalidade do imóvel"
        className="mb-4 inline-flex rounded-xl bg-navy-50 p-1"
      >
        {OPCOES_FINALIDADE.map((opcao) => (
          <button
            key={opcao.value || "ambos"}
            type="button"
            role="tab"
            aria-selected={filtros.finalidade === opcao.value}
            onClick={() => atualizarCampo("finalidade", opcao.value)}
            className={`rounded-lg px-5 py-2 font-body text-sm font-semibold transition ${
              filtros.finalidade === opcao.value
                ? "bg-navy-800 text-white"
                : "text-navy-500 hover:text-navy-800"
            }`}
          >
            {opcao.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <select
          aria-label="Cidade"
          value={filtros.cidade}
          onChange={(e) => atualizarCampo("cidade", e.target.value)}
          className={classesSelect(filtros.cidade)}
        >
          <option value="">Selecione uma cidade</option>
          {cidades.map((cidade) => (
            <option key={cidade.valor} value={cidade.valor}>
              {cidade.rotulo}
            </option>
          ))}
        </select>

        <select
          aria-label="Bairro"
          value={filtros.bairro}
          onChange={(e) => atualizarCampo("bairro", e.target.value)}
          disabled={!filtros.cidade}
          className={classesSelect(filtros.bairro)}
        >
          {filtros.cidade ? (
            <>
              <option value="">Todos os bairros</option>
              {bairrosDisponiveis.map((bairro) => (
                <option
                  key={`${bairro.cidade}-${bairro.valor}`}
                  value={bairro.valor}
                >
                  {bairro.rotulo}
                </option>
              ))}
            </>
          ) : (
            <option value="">Selecione primeiro uma cidade</option>
          )}
        </select>

        <select
          aria-label="Categoria"
          value={filtros.categoria}
          onChange={(e) => atualizarCampo("categoria", e.target.value)}
          className={classesSelect(filtros.categoria)}
        >
          <option value="">Todas as categorias</option>
          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {capitalizar(categoria)}
            </option>
          ))}
        </select>

        <input
          aria-label="Preço máximo"
          type="number"
          min={0}
          placeholder="Até R$"
          value={filtros.precoMax}
          onChange={(e) => atualizarCampo("precoMax", e.target.value)}
          className={`${classesCampo} placeholder:text-navy-400`}
        />

        <select
          aria-label="Quartos mínimos"
          value={filtros.quartos}
          onChange={(e) => atualizarCampo("quartos", e.target.value)}
          className={classesSelect(filtros.quartos)}
        >
          <option value="">Qualquer quantidade de quartos</option>
          {OPCOES_QUARTOS.map((quantidade) => (
            <option key={quantidade} value={quantidade}>
              {quantidade}+
            </option>
          ))}
        </select>

        <select
          aria-label="Vagas mínimas"
          value={filtros.vagas}
          onChange={(e) => atualizarCampo("vagas", e.target.value)}
          className={classesSelect(filtros.vagas)}
        >
          <option value="">Qualquer quantidade de vagas</option>
          {OPCOES_VAGAS.map((quantidade) => (
            <option key={quantidade} value={quantidade}>
              {quantidade}+
            </option>
          ))}
        </select>

        <select
          aria-label="Ordenar por"
          value={filtros.ordenar}
          onChange={(e) => atualizarCampo("ordenar", e.target.value)}
          className={classesSelect(filtros.ordenar)}
        >
          {OPCOES_ORDENACAO.map((opcao) => (
            <option key={opcao.value || "recentes"} value={opcao.value}>
              {opcao.value ? opcao.label : `Ordenar por: ${opcao.label}`}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          className="rounded-xl bg-navy-800 px-6 py-2.5 font-body text-sm font-semibold text-white transition hover:bg-navy-700"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
