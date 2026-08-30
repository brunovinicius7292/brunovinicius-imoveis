"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatarMoeda } from "@/lib/utils/preco";
import { capitalizarPalavras } from "@/lib/utils/texto";
import { linkWhatsapp } from "@/lib/utils/whatsapp";
import { obterUrlImovel } from "@/lib/utils/site";
import { ROTULOS_CLASSIFICACAO } from "@/lib/matching/compatibilidade";
import { EstadoRelacao } from "@/lib/types/compatibilidade";
import { ImovelComRelacao } from "@/lib/supabase/compatibilidade-admin";
import FotoCardRadar from "@/components/admin/FotoCardRadar";
import BotaoCompartilhar from "@/components/public/BotaoCompartilhar";
import {
  adicionarImovelManualmente,
  definirEstadoImovelCliente,
} from "@/app/(admin)/admin/clientes/compatibilidade-actions";

const CLASSES_CLASSIFICACAO: Record<string, string> = {
  alta: "bg-green-100 text-green-700",
  media: "bg-amber-100 text-amber-700",
  baixa: "bg-navy-100 text-navy-500",
};

const CLASSES_BOTAO_CARD =
  "rounded-lg border px-3 py-1.5 font-body text-xs font-semibold transition disabled:opacity-50";

interface OpcaoImovel {
  id: string;
  titulo: string;
  tipo: string;
  cidade: string;
}

interface ClienteResumo {
  id: string;
  nome: string;
  whatsapp: string;
}

export default function ImoveisCompativeisCliente({
  cliente,
  sugeridos,
  manuais,
  ocultos,
  opcoesParaAdicionar,
}: {
  cliente: ClienteResumo;
  sugeridos: ImovelComRelacao[];
  manuais: ImovelComRelacao[];
  ocultos: ImovelComRelacao[];
  opcoesParaAdicionar: OpcaoImovel[];
}) {
  const router = useRouter();
  const [imovelParaAdicionar, setImovelParaAdicionar] = useState("");
  const [carregandoAcao, setCarregandoAcao] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [mostrarOcultos, setMostrarOcultos] = useState(false);

  async function aplicarEstado(imovelId: string, estado: EstadoRelacao) {
    setErro(null);
    setCarregandoAcao(imovelId);

    const resultado = await definirEstadoImovelCliente(cliente.id, imovelId, estado);

    setCarregandoAcao(null);

    if (!resultado.sucesso) {
      setErro(resultado.erro ?? "Não foi possível atualizar o imóvel.");
      return;
    }

    router.refresh();
  }

  async function handleAdicionarManual() {
    if (!imovelParaAdicionar) return;

    setErro(null);
    setCarregandoAcao(imovelParaAdicionar);

    const resultado = await adicionarImovelManualmente(cliente.id, imovelParaAdicionar);

    setCarregandoAcao(null);

    if (!resultado.sucesso) {
      setErro(resultado.erro ?? "Não foi possível adicionar o imóvel.");
      return;
    }

    setImovelParaAdicionar("");
    router.refresh();
  }

  function CardImovel({ item }: { item: ImovelComRelacao }) {
    const { imovel, resultado, relacao } = item;
    const motivos =
      resultado.motivos.length > 0
        ? resultado.motivos.join(", ")
        : `${capitalizarPalavras(imovel.tipo)} · ${formatarMoeda(imovel.preco)}`;
    const carregando = carregandoAcao === imovel.id;
    const favoritado = relacao?.estado === "favorito";
    const enviado = relacao?.estado === "enviado";
    const urlImovel = obterUrlImovel(imovel.slug);
    const mensagemOferta = `Olá, ${cliente.nome}! Separei este imóvel que pode combinar com o que você procura: ${imovel.titulo}. Veja aqui: ${urlImovel}`;

    return (
      <div className="flex gap-3 rounded-xl border border-navy-100 p-4">
        <FotoCardRadar
          fotoCapaUrl={imovel.fotoCapaUrl}
          videoYoutubeUrl={imovel.videoYoutubeUrl}
          alt={imovel.titulo}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link
                href={`/admin/imoveis/${imovel.id}/editar`}
                className="font-body text-sm font-semibold text-navy-900 hover:text-gold-600"
              >
                {imovel.titulo}
              </Link>
              <p className="mt-0.5 font-body text-xs text-navy-500">
                {imovel.bairro}, {imovel.cidade}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {relacao?.origem === "manual" && (
                <span className="rounded-full bg-navy-50 px-2 py-1 text-xs font-medium text-navy-500">
                  Adicionado manualmente
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

          <p className="mt-2 font-body text-sm text-navy-600">{motivos}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={linkWhatsapp(cliente.whatsapp, mensagemOferta)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => aplicarEstado(imovel.id, "enviado")}
              className={`${CLASSES_BOTAO_CARD} border-[#25D366] bg-[#25D366]/10 text-green-700 hover:bg-[#25D366]/20`}
            >
              Ofertar no WhatsApp
            </a>
            <BotaoCompartilhar
              titulo={imovel.titulo}
              url={urlImovel}
              className={`${CLASSES_BOTAO_CARD} inline-flex items-center gap-1.5 border-navy-200 text-navy-600 hover:border-navy-300`}
            />
            <button
              type="button"
              disabled={carregando}
              onClick={() => aplicarEstado(imovel.id, favoritado ? "sugerido" : "favorito")}
              className={`${CLASSES_BOTAO_CARD} ${
                favoritado
                  ? "border-gold-400 bg-gold-50 text-navy-900"
                  : "border-navy-200 text-navy-600 hover:border-navy-300"
              }`}
            >
              {favoritado ? "★ Favorito" : "☆ Favoritar"}
            </button>
            <button
              type="button"
              disabled={carregando}
              onClick={() => aplicarEstado(imovel.id, enviado ? "sugerido" : "enviado")}
              className={`${CLASSES_BOTAO_CARD} ${
                enviado
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-navy-200 text-navy-600 hover:border-navy-300"
              }`}
            >
              {enviado ? "Enviado ✓" : "Marcar como enviado"}
            </button>
            <button
              type="button"
              disabled={carregando}
              onClick={() => aplicarEstado(imovel.id, "oculto")}
              className={`${CLASSES_BOTAO_CARD} border-navy-200 text-navy-500 hover:border-red-300 hover:text-red-600`}
            >
              Ocultar para este cliente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {erro && (
        <p role="alert" className="mb-3 font-body text-sm text-red-600">
          {erro}
        </p>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <label className="flex-1 min-w-[220px]">
          <span className="mb-1 block font-body text-sm font-medium text-navy-700">
            Adicionar imóvel manualmente
          </span>
          <select
            value={imovelParaAdicionar}
            onChange={(e) => setImovelParaAdicionar(e.target.value)}
            className="w-full rounded-lg border border-navy-200 px-3 py-2 font-body text-navy-800 focus:border-gold-400 focus:outline-none"
          >
            <option value="">Selecione um imóvel...</option>
            {opcoesParaAdicionar.map((opcao) => (
              <option key={opcao.id} value={opcao.id}>
                {opcao.titulo} — {opcao.tipo}, {opcao.cidade}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={handleAdicionarManual}
          disabled={!imovelParaAdicionar || carregandoAcao === imovelParaAdicionar}
          className="rounded-lg bg-navy-800 px-4 py-2 font-body text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
        >
          Adicionar
        </button>
      </div>

      {manuais.length > 0 && (
        <div className="mt-6">
          <h3 className="font-body text-sm font-semibold text-navy-700">
            Adicionados manualmente
          </h3>
          <div className="mt-2 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {manuais.map((item) => (
              <CardImovel key={item.imovel.id} item={item} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-body text-sm font-semibold text-navy-700">
          Sugeridos automaticamente
        </h3>
        {sugeridos.length === 0 ? (
          <p className="mt-2 font-body text-sm text-navy-400">
            Nenhum imóvel disponível bate com o perfil deste cliente ainda.
          </p>
        ) : (
          <div className="mt-2 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {sugeridos.map((item) => (
              <CardImovel key={item.imovel.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {ocultos.length > 0 && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setMostrarOcultos((atual) => !atual)}
            className="font-body text-sm font-medium text-navy-500 hover:text-navy-700"
          >
            {mostrarOcultos ? "Ocultar" : "Mostrar"} ocultados ({ocultos.length})
          </button>

          {mostrarOcultos && (
            <div className="mt-2 grid grid-cols-1 gap-3 lg:grid-cols-2">
              {ocultos.map((item) => (
                <div key={item.imovel.id} className="rounded-xl border border-navy-100 p-4">
                  <p className="font-body text-sm font-semibold text-navy-900">
                    {item.imovel.titulo}
                  </p>
                  <p className="mt-0.5 font-body text-xs text-navy-500">
                    {item.imovel.bairro}, {item.imovel.cidade}
                  </p>
                  <button
                    type="button"
                    disabled={carregandoAcao === item.imovel.id}
                    onClick={() => aplicarEstado(item.imovel.id, "sugerido")}
                    className="mt-3 rounded-lg border border-navy-200 px-3 py-1.5 font-body text-xs font-semibold text-navy-600 transition hover:border-navy-300 disabled:opacity-50"
                  >
                    Reexibir
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
