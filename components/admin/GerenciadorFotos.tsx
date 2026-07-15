"use client";

import { useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { enviarFotos, excluirFoto } from "@/app/(admin)/admin/imoveis/actions";

interface FotoItem {
  id: string;
  url: string; // caminho salvo no banco — não é a URL pública
}

export default function GerenciadorFotos({
  imovelId,
  fotosIniciais,
}: {
  imovelId: string;
  fotosIniciais: FotoItem[];
}) {
  const supabase = createSupabaseBrowserClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [fotos, setFotos] = useState<FotoItem[]>(fotosIniciais);
  const [enviando, setEnviando] = useState(false);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  function urlPublica(caminho: string) {
    return supabase.storage.from("imoveis").getPublicUrl(caminho).data
      .publicUrl;
  }

  async function handleEnviar() {
    const arquivos = inputRef.current?.files;
    if (!arquivos || arquivos.length === 0) {
      setErro("Selecione ao menos uma foto.");
      return;
    }

    setErro(null);
    setSucesso(null);
    setEnviando(true);

    const formData = new FormData();
    formData.set("imovelId", imovelId);
    Array.from(arquivos).forEach((arquivo) => formData.append("fotos", arquivo));

    const resultado = await enviarFotos(formData);

    setEnviando(false);

    if (!resultado.sucesso) {
      setErro(resultado.erro ?? "Não foi possível enviar as fotos.");
      return;
    }

    setFotos((atual) => [...atual, ...(resultado.fotos ?? [])]);
    setSucesso("Fotos enviadas com sucesso!");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleExcluir(foto: FotoItem) {
    const confirmar = window.confirm(
      "Excluir esta foto? Essa ação não pode ser desfeita."
    );
    if (!confirmar) return;

    setErro(null);
    setSucesso(null);
    setExcluindoId(foto.id);

    const resultado = await excluirFoto(foto.id, foto.url);

    setExcluindoId(null);

    if (!resultado.sucesso) {
      setErro(resultado.erro ?? "Não foi possível excluir a foto.");
      return;
    }

    setFotos((atual) => atual.filter((item) => item.id !== foto.id));
  }

  return (
    <div>
      {fotos.length === 0 ? (
        <p className="font-body text-sm text-navy-400">
          Nenhuma foto enviada ainda.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {fotos.map((foto, indice) => (
            <div
              key={foto.id}
              className="relative overflow-hidden rounded-xl ring-1 ring-navy-900/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urlPublica(foto.url)}
                alt="Foto do imóvel"
                className="h-28 w-full object-cover"
              />
              {indice === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-gold-400 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy-900">
                  Capa
                </span>
              )}
              <button
                type="button"
                onClick={() => handleExcluir(foto)}
                disabled={excluindoId === foto.id}
                className="absolute right-1.5 top-1.5 rounded-full bg-navy-900/80 px-2 py-1 text-xs font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {excluindoId === foto.id ? "..." : "Excluir"}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="font-body text-sm text-navy-600"
        />
        <button
          type="button"
          onClick={handleEnviar}
          disabled={enviando}
          className="rounded-lg bg-navy-800 px-4 py-2 font-body text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
        >
          {enviando ? "Enviando..." : "Enviar fotos"}
        </button>
      </div>

      {erro && (
        <p role="alert" className="mt-2 font-body text-sm text-red-600">
          {erro}
        </p>
      )}
      {sucesso && (
        <p role="status" className="mt-2 font-body text-sm text-green-600">
          {sucesso}
        </p>
      )}
    </div>
  );
}
