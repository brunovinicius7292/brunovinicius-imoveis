"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OpcaoBairro, OpcaoLocalidade } from "@/lib/supabase/imoveis";

// Mesma altura, padding e tipografia em todos os campos (selects e inputs),
// para o alinhamento ficar perfeito independentemente do tipo de campo.
const classesCampo =
  "h-11 w-full rounded-lg border border-navy-200 bg-white px-3 font-body text-sm text-navy-800 transition focus:border-gold-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-navy-50 disabled:text-navy-300";

const OPCOES_QUARTOS = ["1", "2", "3", "4", "5"];
const OPCOES_VAGAS = ["1", "2", "3", "4"];

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

interface FiltrosForm {
  cidade: string;
  bairro: string;
  categoria: string;
  precoMax: string;
  quartos: string;
  vagas: string;
}

function lerFiltrosDaUrl(searchParams: URLSearchParams): FiltrosForm {
  return {
    cidade: searchParams.get("cidade") ?? "",
    bairro: searchParams.get("bairro") ?? "",
    categoria: searchParams.get("categoria") ?? "",
    precoMax: searchParams.get("precoMax") ?? "",
    quartos: searchParams.get("quartos") ?? "",
    vagas: searchParams.get("vagas") ?? "",
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

  function classesSelect(valor: string) {
    return `${classesCampo} ${valor ? "text-navy-800" : "text-navy-400"}`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl bg-white p-5 shadow-lg shadow-navy-900/10 sm:p-6"
    >
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
          <option value="">Qualquer quantidade</option>
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
          <option value="">Qualquer quantidade</option>
          {OPCOES_VAGAS.map((quantidade) => (
            <option key={quantidade} value={quantidade}>
              {quantidade}+
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
