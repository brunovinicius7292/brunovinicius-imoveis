import { notFound } from "next/navigation";
import ClienteForm from "@/components/admin/ClienteForm";
import {
  getClientePorId,
  getSugestoesInteresse,
} from "@/lib/supabase/clientes-admin";

export default async function EditarClientePage({
  params,
}: {
  params: { id: string };
}) {
  const cliente = await getClientePorId(params.id);

  if (!cliente) {
    notFound();
  }

  const sugestoesInteresse = await getSugestoesInteresse();

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
    </div>
  );
}
