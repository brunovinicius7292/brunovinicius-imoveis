import Link from "next/link";
import { ROTULOS_CLASSIFICACAO } from "@/lib/matching/compatibilidade";
import { ClienteComRelacao } from "@/lib/supabase/compatibilidade-admin";
import { formatarWhatsapp, linkWhatsapp } from "@/lib/utils/whatsapp";

const CLASSES_CLASSIFICACAO: Record<string, string> = {
  alta: "bg-green-100 text-green-700",
  media: "bg-amber-100 text-amber-700",
  baixa: "bg-navy-100 text-navy-500",
};

const ROTULOS_ESTADO: Record<string, string> = {
  favorito: "Favoritado",
  enviado: "Enviado",
};

// Lista somente leitura — as ações (favoritar, marcar como enviado, ocultar,
// adicionar manualmente) ficam concentradas na edição do cliente, que já é o
// ponto único de verdade para o par cliente/imóvel.
export default function ClientesCompativeisImovel({
  clientes,
}: {
  clientes: ClienteComRelacao[];
}) {
  if (clientes.length === 0) {
    return (
      <p className="font-body text-sm text-navy-400">
        Nenhum cliente cadastrado bate com o perfil deste imóvel ainda.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {clientes.map(({ cliente, resultado, relacao }) => (
        <div key={cliente.id} className="rounded-xl border border-navy-100 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link
                href={`/admin/clientes/${cliente.id}/editar`}
                className="font-body text-sm font-semibold text-navy-900 hover:text-gold-600"
              >
                {cliente.nome}
              </Link>
              <p className="mt-0.5 font-body text-xs text-navy-500">
                <a
                  href={linkWhatsapp(cliente.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:underline"
                >
                  {formatarWhatsapp(cliente.whatsapp)}
                </a>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {relacao && relacao.estado !== "sugerido" && (
                <span className="rounded-full bg-navy-50 px-2 py-1 text-xs font-medium text-navy-500">
                  {ROTULOS_ESTADO[relacao.estado] ?? relacao.estado}
                </span>
              )}
              {relacao?.origem === "manual" && (
                <span className="rounded-full bg-navy-50 px-2 py-1 text-xs font-medium text-navy-500">
                  Manual
                </span>
              )}
              {resultado.compativel && (
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    CLASSES_CLASSIFICACAO[resultado.classificacao]
                  }`}
                >
                  {ROTULOS_CLASSIFICACAO[resultado.classificacao]}
                </span>
              )}
            </div>
          </div>

          {resultado.motivos.length > 0 && (
            <p className="mt-2 font-body text-sm text-navy-600">
              {resultado.motivos.join(", ")}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
