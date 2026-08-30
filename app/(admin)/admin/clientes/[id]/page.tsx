import { notFound } from "next/navigation";
import Link from "next/link";
import ImoveisCompativeisCliente from "@/components/admin/ImoveisCompativeisCliente";
import AtividadesCliente from "@/components/admin/AtividadesCliente";
import { getClientePorId } from "@/lib/supabase/clientes-admin";
import { getImoveisAdmin } from "@/lib/supabase/imoveis-admin";
import { getRadarDoCliente } from "@/lib/supabase/compatibilidade-admin";
import { getAtividadesDoCliente } from "@/lib/supabase/atividades-admin";
import { formatarWhatsapp, linkWhatsapp } from "@/lib/utils/whatsapp";
import {
  CLASSES_TEMPERATURA,
  ROTULOS_TEMPERATURA,
  CLASSES_FINALIDADE_CLIENTE,
  ROTULOS_FINALIDADE_CLIENTE,
  ROTULOS_FINANCIAMENTO,
  formatarFaixaValor,
  formatarMinimo,
} from "@/lib/utils/cliente";

function ItemPerfil({ label, valor }: { label: string; valor: React.ReactNode }) {
  return (
    <div>
      <dt className="font-body text-xs font-medium uppercase tracking-wide text-navy-400">
        {label}
      </dt>
      <dd className="mt-1 font-body text-sm text-navy-800">{valor}</dd>
    </div>
  );
}

export default async function PerfilClientePage({
  params,
}: {
  params: { id: string };
}) {
  const cliente = await getClientePorId(params.id);

  if (!cliente) {
    notFound();
  }

  const [radar, todosImoveis, atividades] = await Promise.all([
    getRadarDoCliente(cliente),
    getImoveisAdmin(),
    getAtividadesDoCliente(cliente.id),
  ]);

  const idsJaListados = new Set([
    ...radar.sugeridos.map((item) => item.imovel.id),
    ...radar.manuais.map((item) => item.imovel.id),
    ...radar.ocultos.map((item) => item.imovel.id),
  ]);
  const opcoesParaAdicionar = todosImoveis
    .filter((imovel) => imovel.status === "disponivel" && !idsJaListados.has(imovel.id))
    .map((imovel) => ({
      id: imovel.id,
      titulo: imovel.titulo,
      tipo: imovel.tipo,
      cidade: imovel.cidade,
    }));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-semibold text-navy-900">
              {cliente.nome}
            </h1>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${CLASSES_TEMPERATURA[cliente.temperatura]}`}
            >
              {ROTULOS_TEMPERATURA[cliente.temperatura]}
            </span>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${CLASSES_FINALIDADE_CLIENTE[cliente.finalidade]}`}
            >
              {ROTULOS_FINALIDADE_CLIENTE[cliente.finalidade]}
            </span>
          </div>
          <p className="mt-1 font-body text-navy-500">
            Perfil do cliente — dados, imóveis compatíveis e histórico de atividades.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={linkWhatsapp(cliente.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-[#25D366] px-4 py-2.5 font-body text-sm font-semibold text-white transition hover:brightness-95"
          >
            Conversar no WhatsApp
          </a>
          <Link
            href={`/admin/clientes/${cliente.id}/editar`}
            className="rounded-lg border border-navy-300 px-4 py-2.5 font-body text-sm font-semibold text-navy-700 transition hover:bg-navy-50"
          >
            Editar dados
          </Link>
          <Link
            href="/admin/clientes"
            className="rounded-lg border border-navy-300 px-4 py-2.5 font-body text-sm font-semibold text-navy-700 transition hover:bg-navy-50"
          >
            Voltar para clientes
          </Link>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Perfil do cliente
        </h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ItemPerfil
            label="WhatsApp"
            valor={
              <a
                href={linkWhatsapp(cliente.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:underline"
              >
                {formatarWhatsapp(cliente.whatsapp)}
              </a>
            }
          />
          <ItemPerfil
            label="Finalidade"
            valor={ROTULOS_FINALIDADE_CLIENTE[cliente.finalidade]}
          />
          <ItemPerfil
            label="Tipos de imóvel desejados"
            valor={
              cliente.interesseTipos.length > 0
                ? cliente.interesseTipos.join(", ")
                : "—"
            }
          />
          <ItemPerfil label="Faixa de valor" valor={formatarFaixaValor(cliente)} />
          <ItemPerfil
            label="Financiamento"
            valor={ROTULOS_FINANCIAMENTO[cliente.financiamento]}
          />
          <ItemPerfil
            label="Quartos (mínimo)"
            valor={formatarMinimo(cliente.quartosMin)}
          />
          <ItemPerfil label="Vagas (mínimo)" valor={formatarMinimo(cliente.vagasMin)} />
          <div className="sm:col-span-2 lg:col-span-3">
            <ItemPerfil
              label="Observações"
              valor={cliente.observacoes || "Nenhuma observação registrada."}
            />
          </div>
        </dl>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Imóveis compatíveis
        </h2>
        <p className="mt-1 font-body text-sm text-navy-500">
          Sugestões calculadas a partir do perfil do cliente — tipo, valor
          máximo, financiamento, quartos e vagas.
        </p>
        <div className="mt-4">
          <ImoveisCompativeisCliente
            cliente={{ id: cliente.id, nome: cliente.nome, whatsapp: cliente.whatsapp }}
            sugeridos={radar.sugeridos}
            manuais={radar.manuais}
            ocultos={radar.ocultos}
            opcoesParaAdicionar={opcoesParaAdicionar}
          />
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Atividades recentes
        </h2>
        <p className="mt-1 font-body text-sm text-navy-500">
          Histórico de ofertas, ações no Radar e notas manuais deste cliente.
        </p>
        <div className="mt-4">
          <AtividadesCliente clienteId={cliente.id} atividades={atividades} />
        </div>
      </div>
    </div>
  );
}
