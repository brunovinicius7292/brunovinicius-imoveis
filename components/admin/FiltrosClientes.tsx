"use client";

import { useMemo, useState } from "react";
import { Cliente, FormaPagamento, Temperatura } from "@/lib/types/cliente";
import { chaveNormalizada, capitalizarPalavras } from "@/lib/utils/texto";
import { Campo, classesInput } from "@/components/ui/CampoFormulario";
import TabelaClientes from "@/components/admin/TabelaClientes";

interface Opcao {
  chave: string;
  rotulo: string;
}

// Valores distintos (ignorando maiúsculas/espaços) já cadastrados nos
// clientes carregados, mesma normalização usada nos filtros de Imóveis.
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

export default function FiltrosClientes({ clientes }: { clientes: Cliente[] }) {
  const [temperatura, setTemperatura] = useState<Temperatura | "">("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento | "">(
    ""
  );
  const [interesseTipo, setInteresseTipo] = useState("");

  const tiposInteresse = useMemo(
    () => opcoesUnicas(clientes.map((c) => c.interesseTipo)),
    [clientes]
  );

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((cliente) => {
      if (temperatura && cliente.temperatura !== temperatura) return false;
      if (formaPagamento && cliente.formaPagamento !== formaPagamento)
        return false;
      if (
        interesseTipo &&
        chaveNormalizada(cliente.interesseTipo ?? "") !== interesseTipo
      )
        return false;
      return true;
    });
  }, [clientes, temperatura, formaPagamento, interesseTipo]);

  function limparFiltros() {
    setTemperatura("");
    setFormaPagamento("");
    setInteresseTipo("");
  }

  const filtrosAtivos =
    temperatura !== "" || formaPagamento !== "" || interesseTipo !== "";

  const semResultado = clientes.length > 0 && clientesFiltrados.length === 0;

  return (
    <div>
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-900/5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Campo label="Temperatura">
            <select
              value={temperatura}
              onChange={(e) =>
                setTemperatura(e.target.value as Temperatura | "")
              }
              className={classesInput}
            >
              <option value="">Todas</option>
              <option value="quente">Quente</option>
              <option value="morno">Morno</option>
              <option value="frio">Frio</option>
            </select>
          </Campo>

          <Campo label="Pagamento">
            <select
              value={formaPagamento}
              onChange={(e) =>
                setFormaPagamento(e.target.value as FormaPagamento | "")
              }
              className={classesInput}
            >
              <option value="">Todos</option>
              <option value="a_vista">À vista</option>
              <option value="financiado">Financiado</option>
              <option value="indefinido">Indefinido</option>
            </select>
          </Campo>

          <Campo label="Interesse">
            <select
              value={interesseTipo}
              onChange={(e) => setInteresseTipo(e.target.value)}
              className={classesInput}
            >
              <option value="">Todos</option>
              {tiposInteresse.map((opcao) => (
                <option key={opcao.chave} value={opcao.chave}>
                  {opcao.rotulo}
                </option>
              ))}
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
        {clientesFiltrados.length} de {clientes.length} clientes
      </p>

      {semResultado ? (
        <div className="rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
          <p className="font-body text-sm text-navy-400">
            Nenhum cliente encontrado com os filtros selecionados.
          </p>
        </div>
      ) : (
        <TabelaClientes clientes={clientesFiltrados} />
      )}
    </div>
  );
}
