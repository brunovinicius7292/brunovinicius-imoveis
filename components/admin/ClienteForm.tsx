"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Campo, classesInput } from "@/components/ui/CampoFormulario";
import {
  Cliente,
  FinalidadeCliente,
  FormaPagamento,
  Temperatura,
} from "@/lib/types/cliente";
import {
  atualizarCliente,
  criarCliente,
  ClienteFormDados,
} from "@/app/(admin)/admin/clientes/actions";

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
  const [interesseTipo, setInteresseTipo] = useState(
    cliente?.interesseTipo ?? ""
  );
  const [valorMin, setValorMin] = useState(
    cliente?.valorMin?.toString() ?? ""
  );
  const [valorMax, setValorMax] = useState(
    cliente?.valorMax?.toString() ?? ""
  );
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>(
    cliente?.formaPagamento ?? "indefinido"
  );
  const [temperatura, setTemperatura] = useState<Temperatura>(
    cliente?.temperatura ?? "morno"
  );
  const [observacoes, setObservacoes] = useState(cliente?.observacoes ?? "");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

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
      interesseTipo,
      valorMin: min,
      valorMax: max,
      formaPagamento,
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
      router.push("/admin/clientes");
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
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo label="Tipo de imóvel de interesse">
            <input
              value={interesseTipo}
              onChange={(e) => setInteresseTipo(e.target.value)}
              placeholder="Casa, apartamento, terreno..."
              list="sugestoes-interesse"
              className={classesInput}
            />
            <datalist id="sugestoes-interesse">
              {sugestoesInteresse?.map((sugestao) => (
                <option key={sugestao} value={sugestao} />
              ))}
            </datalist>
          </Campo>
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
