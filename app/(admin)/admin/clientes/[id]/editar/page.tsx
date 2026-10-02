import { notFound } from "next/navigation";
import Link from "next/link";
import ClienteForm from "@/components/admin/ClienteForm";
import {
  getClientePorId,
  getSugestoesInteresse,
} from "@/lib/supabase/clientes-admin";
import { CLASSES_MOMENTO, ROTULOS_MOMENTO } from "@/lib/utils/cliente";

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
      <Link
        href={`/admin/clientes/${cliente.id}`}
        className="font-body text-sm font-medium text-navy-500 hover:text-navy-700"
      >
        ← Voltar para o perfil
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h1 className="font-display text-2xl font-semibold text-navy-900">
          Editar cliente
        </h1>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${CLASSES_MOMENTO[cliente.momento]}`}
        >
          {ROTULOS_MOMENTO[cliente.momento]}
        </span>
      </div>
      <p className="mt-1 font-body text-navy-500">
        Atualize os dados cadastrais do cliente abaixo. A área comercial
        (imóveis compatíveis, histórico, momento comercial) fica na página de
        perfil.
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
