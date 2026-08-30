import { notFound } from "next/navigation";
import ImovelForm from "@/components/admin/ImovelForm";
import GerenciadorFotos from "@/components/admin/GerenciadorFotos";
import ClientesCompativeisImovel from "@/components/admin/ClientesCompativeisImovel";
import {
  getImovelPorId,
  getFotosAdmin,
  getSugestoesFormulario,
} from "@/lib/supabase/imoveis-admin";
import { getClientesCompativeis } from "@/lib/supabase/compatibilidade-admin";

export default async function EditarImovelPage({
  params,
}: {
  params: { id: string };
}) {
  const imovel = await getImovelPorId(params.id);

  if (!imovel) {
    notFound();
  }

  const [fotos, sugestoes, clientesCompativeis] = await Promise.all([
    getFotosAdmin(imovel.id),
    getSugestoesFormulario(),
    getClientesCompativeis(imovel),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">
        Editar imóvel
      </h1>
      <p className="mt-1 font-body text-navy-500">
        Atualize as informações do imóvel abaixo.
      </p>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
        <ImovelForm modo="editar" imovel={imovel} sugestoes={sugestoes} />
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Fotos do imóvel
        </h2>
        <p className="mt-1 font-body text-sm text-navy-500">
          A primeira foto enviada é usada como capa do imóvel.
        </p>
        <div className="mt-4">
          <GerenciadorFotos imovelId={imovel.id} fotosIniciais={fotos} />
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Clientes compatíveis
        </h2>
        <p className="mt-1 font-body text-sm text-navy-500">
          Clientes cadastrados cujo perfil bate com este imóvel. Favoritar,
          marcar como enviado (fora da oferta por WhatsApp) e ocultar ficam
          na edição de cada cliente.
        </p>
        <div className="mt-4">
          <ClientesCompativeisImovel imovel={imovel} clientes={clientesCompativeis} />
        </div>
      </div>
    </div>
  );
}
