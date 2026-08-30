import { notFound } from "next/navigation";
import ClienteForm from "@/components/admin/ClienteForm";
import ImoveisCompativeisCliente from "@/components/admin/ImoveisCompativeisCliente";
import {
  getClientePorId,
  getSugestoesInteresse,
} from "@/lib/supabase/clientes-admin";
import { getImoveisAdmin } from "@/lib/supabase/imoveis-admin";
import { getRadarDoCliente } from "@/lib/supabase/compatibilidade-admin";

export default async function EditarClientePage({
  params,
}: {
  params: { id: string };
}) {
  const cliente = await getClientePorId(params.id);

  if (!cliente) {
    notFound();
  }

  const [sugestoesInteresse, radar, todosImoveis] = await Promise.all([
    getSugestoesInteresse(),
    getRadarDoCliente(cliente),
    getImoveisAdmin(),
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
      <h1 className="font-display text-2xl font-semibold text-navy-900">
        Editar cliente
      </h1>
      <p className="mt-1 font-body text-navy-500">
        Atualize as informações do cliente abaixo.
      </p>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
        <ClienteForm
          modo="editar"
          cliente={cliente}
          sugestoesInteresse={sugestoesInteresse}
        />
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
            clienteId={cliente.id}
            sugeridos={radar.sugeridos}
            manuais={radar.manuais}
            ocultos={radar.ocultos}
            opcoesParaAdicionar={opcoesParaAdicionar}
          />
        </div>
      </div>
    </div>
  );
}
