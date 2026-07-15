import Link from "next/link";
import { getImoveisAdmin } from "@/lib/supabase/imoveis-admin";
import TabelaImoveis from "@/components/admin/TabelaImoveis";

export default async function AdminImoveisPage() {
  const imoveis = await getImoveisAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">
            Imóveis
          </h1>
          <p className="mt-1 font-body text-navy-500">
            Gerencie os imóveis cadastrados no catálogo.
          </p>
        </div>

        <Link
          href="/admin/imoveis/novo"
          className="rounded-lg bg-navy-800 px-4 py-2.5 font-body text-sm font-semibold text-white transition hover:bg-navy-700"
        >
          + Novo imóvel
        </Link>
      </div>

      <div className="mt-6">
        <TabelaImoveis imoveis={imoveis} />
      </div>
    </div>
  );
}
