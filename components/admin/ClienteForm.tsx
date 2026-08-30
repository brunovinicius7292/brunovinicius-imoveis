"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Campo, classesInput } from "@/components/ui/CampoFormulario";
import {
  Cliente,
  FinalidadeCliente,
  FinanciamentoPreferencia,
  FormaPagamento,
  QuartosMin,
  Temperatura,
  VagasMin,
} from "@/lib/types/cliente";
import { capitalizarPalavras, chaveNormalizada } from "@/lib/utils/texto";
import {
  atualizarCliente,
  criarCliente,
  ClienteFormDados,
} from "@/app/(admin)/admin/clientes/actions";

const OPCOES_QUARTOS_MIN: { valor: QuartosMin; rotulo: string }[] = [
  { valor: 0, rotulo: "Indiferente" },
  { valor: 1, rotulo: "1+" },
  { valor: 2, rotulo: "2+" },
  { valor: 3, rotulo: "3+" },
];

const OPCOES_VAGAS_MIN: { valor: VagasMin; rotulo: string }[] = [
  { valor: 0, rotulo: "Indiferente" },
  { valor: 1, rotulo: "1+" },
  { valor: 2, rotulo: "2+" },
];

const OPCOES_TEMPERATURA: {
  valor: Temperatura;
  rotulo: string;
  descricao: string;
  classesAtivo: string;
}[] = [
  {
    valor: "quente",
    rotulo: "Quente",
    descricao: "Possível compra em até 1 mês",
    classesAtivo: "border-red-400 bg-red-50",
  },
  {
    valor: "morno",
    rotulo: "Morno",
    descricao: "Possível compra em até 3 meses",
    classesAtivo: "border-amber-400 bg-amber-50",
  },
  {
    valor: "frio",
    rotulo: "Frio",
    descricao: "Possível compra em até 6 meses",
    classesAtivo: "border-blue-400 bg-blue-50",
  },
];

export default function ClienteForm({
  modo,
  cliente,
  sugestoesInteresse,
}: {
  modo: "criar" | "editar";
  cliente?: Cliente;
  sugestoesInteresse?: string[];
}) {
  const router = useRouter();

  const [nome, setNome] = useState(cliente?.nome ?? "");
  const [whatsapp, setWhatsapp] = useState(cliente?.whatsapp ?? "");
  const [finalidade, setFinalidade] = useState<FinalidadeCliente>(
    cliente?.finalidade ?? "venda"
  );
  const [interesseTipos, setInteresseTipos] = useState<string[]>(
    cliente?.interesseTipos ?? []
  );
  const [novoTipo, setNovoTipo] = useState("");
  const [valorMin, setValorMin] = useState(
    cliente?.valorMin?.toString() ?? ""
  );
  const [valorMax, setValorMax] = useState(
    cliente?.valorMax?.toString() ?? ""
  );
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>(
    cliente?.formaPagamento ?? "indefinido"
  );
  const [quartosMin, setQuartosMin] = useState<QuartosMin>(
    cliente?.quartosMin ?? 0
  );
  const [vagasMin, setVagasMin] = useState<VagasMin>(cliente?.vagasMin ?? 0);
  const [financiamento, setFinanciamento] = useState<FinanciamentoPreferencia>(
    cliente?.financiamento ?? "indiferente"
  );
  const [temperatura, setTemperatura] = useState<Temperatura>(
    cliente?.temperatura ?? "morno"
  );
  const [observacoes, setObservacoes] = useState(cliente?.observacoes ?? "");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  // Opções de tipo exibidas como chips: sugestões vindas do servidor + os
  // tipos já selecionados (cobre um tipo antigo/customizado que não esteja
  // mais entre as sugestões).
  const opcoesTipo = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const tipo of sugestoesInteresse ?? []) {
      mapa.set(chaveNormalizada(tipo), tipo);
    }
    for (const tipo of interesseTipos) {
      const chave = chaveNormalizada(tipo);
      if (!mapa.has(chave)) mapa.set(chave, tipo);
    }
    return Array.from(mapa.values()).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [sugestoesInteresse, interesseTipos]);

  function alternarTipo(tipo: string) {
    setInteresseTipos((atual) => {
      const chave = chaveNormalizada(tipo);
      const jaSelecionado = atual.some((t) => chaveNormalizada(t) === chave);
      if (jaSelecionado) return atual.filter((t) => chaveNormalizada(t) !== chave);
      return [...atual, tipo];
    });
  }

  function adicionarTipoCustom() {
    const valor = capitalizarPalavras(novoTipo);
    if (!valor) return;
    const chave = chaveNormalizada(valor);
    if (!interesseTipos.some((t) => chaveNormalizada(t) === chave)) {
      setInteresseTipos((atual) => [...atual, valor]);
    }
    setNovoTipo("");
  }

  async function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSucesso(false);

    if (!nome.trim()) {
      setErro("Informe o nome do cliente.");
      return;
    }
    if (!whatsapp.trim()) {
      setErro("Informe o WhatsApp do cliente.");
      return;
    }

    const min = valorMin ? Number(valorMin) : null;
    const max = valorMax ? Number(valorMax) : null;
    if (min != null && max != null && min > max) {
      setErro("O valor mínimo não pode ser maior que o valor máximo.");
      return;
    }

    setCarregando(true);

    const dados: ClienteFormDados = {
      nome: nome.trim(),
      whatsapp: whatsapp.trim(),
      finalidade,
      interesseTipos,
      valorMin: min,
      valorMax: max,
      formaPagamento,
      quartosMin,
      vagasMin,
      financiamento,
      temperatura,
      observacoes,
    };

    const resultado =
      modo === "criar"
        ? await criarCliente(dados)
        : await atualizarCliente(cliente!.id, dados);

    setCarregando(false);

    if (!resultado.sucesso) {
      setErro(resultado.erro ?? "Não foi possível salvar o cliente.");
      return;
    }

    setSucesso(true);
    setTimeout(() => {
      if (modo === "criar" && resultado.id) {
        // Redireciona pra edição pra que as sugestões do radar de
        // compatibilidade já apareçam imediatamente.
        router.push(`/admin/clientes/${resultado.id}/editar`);
      } else {
        router.push("/admin/clientes");
      }
      router.refresh();
    }, 900);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section>
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Contato
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo label="Nome" obrigatorio>
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={classesInput}
            />
          </Campo>
          <Campo label="WhatsApp" obrigatorio>
            <input
              required
              type="tel"
              placeholder="(73) 99999-8888"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className={classesInput}
            />
          </Campo>
          <Campo label="Finalidade" obrigatorio>
            <select
              required
              value={finalidade}
              onChange={(e) =>
                setFinalidade(e.target.value as FinalidadeCliente)
              }
              className={classesInput}
            >
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
            </select>
          </Campo>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Interesse
        </h2>
        <div className="mt-3">
          <Campo label="Tipos de imóvel de interesse">
            <div className="flex flex-wrap gap-2">
              {opcoesTipo.length === 0 && (
                <p className="font-body text-sm text-navy-400">
                  Nenhum tipo cadastrado ainda — use o campo abaixo.
                </p>
              )}
              {opcoesTipo.map((tipo) => {
                const ativo = interesseTipos.some(
                  (t) => chaveNormalizada(t) === chaveNormalizada(tipo)
                );
                return (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => alternarTipo(tipo)}
                    aria-pressed={ativo}
                    className={`rounded-full border px-3 py-1.5 font-body text-sm transition ${
                      ativo
                        ? "border-gold-400 bg-gold-50 text-navy-900"
                        : "border-navy-200 text-navy-600 hover:border-navy-300"
                    }`}
                  >
                    {tipo}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                value={novoTipo}
                onChange={(e) => setNovoTipo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    adicionarTipoCustom();
                  }
                }}
                placeholder="Outro tipo (ex.: prédio)..."
                className={classesInput}
              />
              <button
                type="button"
                onClick={adicionarTipoCustom}
                className="shrink-0 rounded-lg border border-navy-300 px-4 py-2 font-body text-sm font-semibold text-navy-700 transition hover:bg-navy-50"
              >
                Adicionar
              </button>
            </div>
          </Campo>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo label="Forma de pagamento">
            <select
              value={formaPagamento}
              onChange={(e) =>
                setFormaPagamento(e.target.value as FormaPagamento)
              }
              className={classesInput}
            >
              <option value="indefinido">Indefinido</option>
              <option value="a_vista">À vista</option>
              <option value="financiado">Financiado</option>
            </select>
          </Campo>
          <Campo label="Financiamento">
            <select
              value={financiamento}
              onChange={(e) =>
                setFinanciamento(e.target.value as FinanciamentoPreferencia)
              }
              className={classesInput}
            >
              <option value="indiferente">Indiferente</option>
              <option value="precisa_aceita">Precisa aceitar financiamento</option>
              <option value="nao_aceita">Não aceita financiamento</option>
            </select>
          </Campo>
          <Campo label="Valor mínimo (R$)">
            <input
              type="number"
              min={0}
              step="0.01"
              value={valorMin}
              onChange={(e) => setValorMin(e.target.value)}
              className={classesInput}
            />
          </Campo>
          <Campo label="Valor máximo (R$)">
            <input
              type="number"
              min={0}
              step="0.01"
              value={valorMax}
              onChange={(e) => setValorMax(e.target.value)}
              className={classesInput}
            />
          </Campo>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo label="Quartos (mínimo)">
            <div className="flex flex-wrap gap-2">
              {OPCOES_QUARTOS_MIN.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => setQuartosMin(opcao.valor)}
                  aria-pressed={quartosMin === opcao.valor}
                  className={`rounded-full border px-3 py-1.5 font-body text-sm transition ${
                    quartosMin === opcao.valor
                      ? "border-gold-400 bg-gold-50 text-navy-900"
                      : "border-navy-200 text-navy-600 hover:border-navy-300"
                  }`}
                >
                  {opcao.rotulo}
                </button>
              ))}
            </div>
          </Campo>
          <Campo label="Vagas (mínimo)">
            <div className="flex flex-wrap gap-2">
              {OPCOES_VAGAS_MIN.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => setVagasMin(opcao.valor)}
                  aria-pressed={vagasMin === opcao.valor}
                  className={`rounded-full border px-3 py-1.5 font-body text-sm transition ${
                    vagasMin === opcao.valor
                      ? "border-gold-400 bg-gold-50 text-navy-900"
                      : "border-navy-200 text-navy-600 hover:border-navy-300"
                  }`}
                >
                  {opcao.rotulo}
                </button>
              ))}
            </div>
          </Campo>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Temperatura
        </h2>
        <p className="mt-1 font-body text-sm text-navy-500">
          Sua estimativa de quando esse cliente deve fechar negócio.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {OPCOES_TEMPERATURA.map((opcao) => (
            <label
              key={opcao.valor}
              className={`cursor-pointer rounded-xl border-2 p-4 transition ${
                temperatura === opcao.valor
                  ? opcao.classesAtivo
                  : "border-navy-200 hover:border-navy-300"
              }`}
            >
              <input
                type="radio"
                name="temperatura"
                value={opcao.valor}
                checked={temperatura === opcao.valor}
                onChange={() => setTemperatura(opcao.valor)}
                className="sr-only"
              />
              <p className="font-body text-sm font-semibold text-navy-900">
                {opcao.rotulo}
              </p>
              <p className="mt-1 font-body text-xs text-navy-500">
                {opcao.descricao}
              </p>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Observações
        </h2>
        <div className="mt-3">
          <Campo label="Notas">
            <textarea
              rows={4}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Detalhes da conversa, restrições, preferências..."
              className={classesInput}
            />
          </Campo>
        </div>
      </section>

      {erro && (
        <p role="alert" className="font-body text-sm text-red-600">
          {erro}
        </p>
      )}
      {sucesso && (
        <p role="status" className="font-body text-sm text-green-600">
          Cliente salvo com sucesso!
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={carregando}
          className="rounded-lg bg-navy-800 px-6 py-2.5 font-body text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
        >
          {carregando ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/clientes")}
          className="rounded-lg border border-navy-300 px-6 py-2.5 font-body text-sm font-semibold text-navy-700 transition hover:bg-navy-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
