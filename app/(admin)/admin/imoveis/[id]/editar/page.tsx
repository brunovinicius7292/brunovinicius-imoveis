import { notFound } from "next/navigation";
import ImovelForm from "@/components/admin/ImovelForm";
import GerenciadorFotos from "@/components/admin/GerenciadorFotos";
import { getImovelPorId, getFotosAdmin } from "@/lib/supabase/imoveis-admin";

export default async function EditarImovelPage({
  params,
}: {
  params: { id: string };
}) {
  const imovel = await getImovelPorId(params.id);

  if (!imovel) {
    notFound();
  }

  const fotos = await getFotosAdmin(imovel.id);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">
        Editar imóvel
      </h1>
      <p className="mt-1 font-body text-navy-500">
        Atualize as informações do imóvel abaixo.
      </p>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
        <ImovelForm modo="editar" imovel={imovel} />
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
    </div>
  );
}
