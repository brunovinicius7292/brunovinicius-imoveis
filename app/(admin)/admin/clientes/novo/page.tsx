import ClienteForm from "@/components/admin/ClienteForm";
import { getSugestoesInteresse } from "@/lib/supabase/clientes-admin";

export default async function NovoClientePage() {
  const sugestoesInteresse = await getSugestoesInteresse();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">
        Novo cliente
      </h1>
      <p className="mt-1 font-body text-navy-500">
        Cadastre só quem tem chance real de negócio — isso mantém a lista útil
        pra priorizar o follow-up certo.
      </p>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
        <ClienteForm modo="criar" sugestoesInteresse={sugestoesInteresse} />
      </div>
    </div>
  );
}
