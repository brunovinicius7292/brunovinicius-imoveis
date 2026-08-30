"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Imovel } from "@/lib/types/imovel";
import { ROTULOS_CLASSIFICACAO } from "@/lib/matching/compatibilidade";
import { ClienteComRelacao } from "@/lib/supabase/compatibilidade-admin";
import { formatarWhatsapp, linkWhatsapp } from "@/lib/utils/whatsapp";
import { obterUrlImovel } from "@/lib/utils/site";
import FotoCardRadar from "@/components/admin/FotoCardRadar";
import BotaoCompartilhar from "@/components/public/BotaoCompartilhar";
import { definirEstadoImovelCliente } from "@/app/(admin)/admin/clientes/compatibilidade-actions";

const CLASSES_CLASSIFICACAO: Record<string, string> = {
  alta: "bg-green-100 text-green-700",
  media: "bg-amber-100 text-amber-700",
  baixa: "bg-navy-100 text-navy-500",
};

const ROTULOS_ESTADO: Record<string, string> = {
  favorito: "Favoritado",
  enviado: "Enviado",
};

const CLASSES_BOTAO_CARD =
  "rounded-lg border px-3 py-1.5 font-body text-xs font-semibold transition disabled:opacity-50";

// As ações de favoritar/marcar como enviado/ocultar continuam concentradas
// na edição do cliente (ponto único de verdade para o par cliente/imóvel) —
// aqui só "Ofertar no WhatsApp" (que também marca como enviado) e
// "Compartilhar", que fazem sentido a partir da tela do imóvel também.
export default function ClientesCompativeisImovel({
  imovel,
  clientes,
}: {
  imovel: Imovel;
  clientes: ClienteComRelacao[];
}) {
  const router = useRouter();
  const [carregandoAcao, setCarregandoAcao] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const urlImovel = obterUrlImovel(imovel.slug);

  async function handleOfertar(clienteId: string) {
    setErro(null);
    setCarregandoAcao(clienteId);

    const resultado = await definirEstadoImovelCliente(clienteId, imovel.id, "enviado");

    setCarregandoAcao(null);

    if (!resultado.sucesso) {
      setErro(resultado.erro ?? "Não foi possível registrar o envio.");
      return;
    }

    router.refresh();
  }

  if (clientes.length === 0) {
    return (
      <p className="font-body text-sm text-navy-400">
        Nenhum cliente cadastrado bate com o perfil deste imóvel ainda.
      </p>
    );
  }

  return (
    <div>
      {erro && (
        <p role="alert" className="mb-3 font-body text-sm text-red-600">
          {erro}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {clientes.map(({ cliente, resultado, relacao }) => {
          const mensagemOferta = `Olá, ${cliente.nome}! Separei este imóvel que pode combinar com o que você procura: ${imovel.titulo}. Veja aqui: ${urlImovel}`;

          return (
            <div key={cliente.id} className="flex gap-3 rounded-xl border border-navy-100 p-4">
              <FotoCardRadar
                fotoCapaUrl={imovel.fotoCapaUrl}
                videoYoutubeUrl={imovel.videoYoutubeUrl}
                alt={imovel.titulo}
              />
              <div className="min-w-0 flex-1">
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

                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={linkWhatsapp(cliente.whatsapp, mensagemOferta)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleOfertar(cliente.id)}
                    className={`${CLASSES_BOTAO_CARD} border-[#25D366] bg-[#25D366]/10 text-green-700 hover:bg-[#25D366]/20`}
                  >
                    Ofertar no WhatsApp
                  </a>
                  <BotaoCompartilhar
                    titulo={imovel.titulo}
                    url={urlImovel}
                    className={`${CLASSES_BOTAO_CARD} inline-flex items-center gap-1.5 border-navy-200 text-navy-600 hover:border-navy-300`}
                  />
                </div>

                {carregandoAcao === cliente.id && (
                  <p className="mt-1 font-body text-xs text-navy-400">Registrando envio...</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
