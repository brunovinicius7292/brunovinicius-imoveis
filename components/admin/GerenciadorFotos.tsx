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
  const [progresso, setProgresso] = useState<{ atual: number; total: number } | null>(
    null
  );
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  function urlPublica(caminho: string) {
    return supabase.storage.from("imoveis").getPublicUrl(caminho).data
      .publicUrl;
  }

  // Envia uma foto por requisição em vez de todas de uma vez: Server Actions
  // do Next.js têm um limite de tamanho de corpo (1 MB por padrão) e, juntando
  // várias fotos de celular no mesmo request, esse limite estourava e o envio
  // inteiro falhava sem nenhum aviso — daí o loop sequencial e o try/catch
  // abaixo, que também garantem a ordem correta das fotos (a "ordem" de cada
  // uma é calculada no servidor a partir da última foto já salva).
  async function handleEnviar() {
    const arquivos = inputRef.current?.files;
    if (!arquivos || arquivos.length === 0) {
      setErro("Selecione ao menos uma foto.");
      return;
    }

    setErro(null);
    setSucesso(null);
    setEnviando(true);

    const listaArquivos = Array.from(arquivos);
    const fotosNovas: FotoItem[] = [];
    let enviadas = 0;

    for (const arquivo of listaArquivos) {
      setProgresso({ atual: enviadas + 1, total: listaArquivos.length });

      const formData = new FormData();
      formData.set("imovelId", imovelId);
      formData.append("fotos", arquivo);

      try {
        const resultado = await enviarFotos(formData);

        if (!resultado.sucesso) {
          setErro(
            `Falha ao enviar "${arquivo.name}": ${resultado.erro ?? "erro desconhecido"}. ${enviadas} de ${listaArquivos.length} foto(s) enviada(s) antes da falha.`
          );
          break;
        }

        fotosNovas.push(...(resultado.fotos ?? []));
        enviadas += 1;
      } catch (excecao) {
        setErro(
          `Falha ao enviar "${arquivo.name}": ${
            excecao instanceof Error ? excecao.message : "erro de conexão"
          }. ${enviadas} de ${listaArquivos.length} foto(s) enviada(s) antes da falha.`
        );
        break;
      }
    }

    setProgresso(null);
    setEnviando(false);

    if (fotosNovas.length > 0) {
      setFotos((atual) => [...atual, ...fotosNovas]);
    }

    if (enviadas === listaArquivos.length) {
      setSucesso(
        listaArquivos.length === 1
          ? "Foto enviada com sucesso!"
          : `${enviadas} fotos enviadas com sucesso!`
      );
      if (inputRef.current) inputRef.current.value = "";
    }
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
          {enviando
            ? progresso
              ? `Enviando ${progresso.atual} de ${progresso.total}...`
              : "Enviando..."
            : "Enviar fotos"}
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
