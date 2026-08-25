import Link from "next/link";
import { getClientesAdmin } from "@/lib/supabase/clientes-admin";
import AbasClientesFinalidade from "@/components/admin/AbasClientesFinalidade";

export default async function AdminClientesPage() {
  const clientes = await getClientesAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">
            Clientes
          </h1>
          <p className="mt-1 font-body text-navy-500">
            Clientes com chance real de negócio, organizados por temperatura.
          </p>
        </div>

        <Link
          href="/admin/clientes/novo"
          className="rounded-lg bg-navy-800 px-4 py-2.5 font-body text-sm font-semibold text-white transition hover:bg-navy-700"
        >
          + Novo cliente
        </Link>
      </div>

      <div className="mt-6">
        <AbasClientesFinalidade clientes={clientes} />
      </div>
    </div>
  );
}
