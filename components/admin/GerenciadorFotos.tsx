"use client";

import { ChangeEvent, PointerEvent as ReactPointerEvent, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  enviarFotos,
  excluirFoto,
  excluirTodasFotos,
  reordenarFotos,
  substituirFoto,
} from "@/app/(admin)/admin/imoveis/actions";
import { moverItem, moverParaCapa } from "@/lib/utils/fotos";

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
  const inputSubstituirRef = useRef<HTMLInputElement>(null);
  // Refs das miniaturas indexadas por id (não por posição, que muda a cada
  // reordenação) — usadas para medir a posição de cada foto na tela durante
  // o arraste e descobrir qual delas está mais perto do ponteiro.
  const refsMiniaturas = useRef(new Map<string, HTMLDivElement>());
  // Snapshot da ordem antes de começar um arraste/movimento, para poder
  // desfazer no estado local caso o servidor recuse a nova ordem.
  const ordemAntesDoArrasteRef = useRef<FotoItem[]>(fotosIniciais);
  const fotoParaSubstituirRef = useRef<FotoItem | null>(null);

  const [fotos, setFotos] = useState<FotoItem[]>(fotosIniciais);
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState<{ atual: number; total: number } | null>(
    null
  );
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [excluindoTodas, setExcluindoTodas] = useState(false);
  const [substituindoId, setSubstituindoId] = useState<string | null>(null);
  const [salvandoOrdem, setSalvandoOrdem] = useState(false);
  const [arrastandoId, setArrastandoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  // Qualquer ação que mude a lista de fotos (upload, exclusão, reordenar,
  // substituir) fica bloqueada enquanto outra já está em andamento — evita
  // envio duplicado e estados inconsistentes (ex.: reordenar durante upload).
  const ocupado =
    enviando || excluindoTodas || salvandoOrdem || excluindoId !== null || substituindoId !== null;

  function urlPublica(caminho: string) {
    return supabase.storage.from("imoveis").getPublicUrl(caminho).data
      .publicUrl;
  }

  // Aplica uma nova ordem otimisticamente na tela e tenta persistir no
  // servidor; se falhar, reverte para a ordem anterior e mostra o erro.
  // Compartilhada pelo drag-and-drop, pelos botões de mover e por "Definir
  // como capa" (que também é, no fundo, mover a foto para o início).
  async function persistirNovaOrdem(novaLista: FotoItem[], ordemAnterior: FotoItem[]) {
    setFotos(novaLista);
    setSalvandoOrdem(true);
    setErro(null);

    const resultado = await reordenarFotos(
      imovelId,
      novaLista.map((foto) => foto.id)
    );

    setSalvandoOrdem(false);

    if (!resultado.sucesso) {
      setErro(resultado.erro ?? "Não foi possível salvar a nova ordem das fotos.");
      setFotos(ordemAnterior);
      return false;
    }

    return true;
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
    setSucesso("Foto excluída.");
  }

  async function handleExcluirTodas() {
    if (fotos.length === 0) return;

    const confirmar = window.confirm(
      "Excluir TODAS as fotos deste imóvel? Essa ação não pode ser desfeita."
    );
    if (!confirmar) return;

    setErro(null);
    setSucesso(null);
    setExcluindoTodas(true);

    const resultado = await excluirTodasFotos(imovelId);

    setExcluindoTodas(false);

    if (!resultado.sucesso) {
      setErro(resultado.erro ?? "Não foi possível excluir as fotos.");
      return;
    }

    setFotos([]);
    setSucesso("Todas as fotos foram excluídas.");
  }

  function handleClicarSubstituir(foto: FotoItem) {
    fotoParaSubstituirRef.current = foto;
    inputSubstituirRef.current?.click();
  }

  async function handleArquivoSubstituto(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    const alvo = fotoParaSubstituirRef.current;
    evento.target.value = ""; // permite escolher o mesmo arquivo de novo depois

    if (!arquivo || !alvo) return;

    setErro(null);
    setSucesso(null);
    setSubstituindoId(alvo.id);

    const formData = new FormData();
    formData.set("foto", arquivo);

    const resultado = await substituirFoto(alvo.id, imovelId, alvo.url, formData);

    setSubstituindoId(null);
    fotoParaSubstituirRef.current = null;

    if (!resultado.sucesso || !resultado.fotos?.[0]) {
      setErro(resultado.erro ?? "Não foi possível substituir a foto.");
      return;
    }

    const atualizada = resultado.fotos[0];
    setFotos((atual) =>
      atual.map((foto) => (foto.id === atualizada.id ? atualizada : foto))
    );
    setSucesso("Foto substituída com sucesso!");
  }

  async function handleDefinirCapa(indice: number) {
    if (indice === 0 || ocupado) return;

    const ordemAnterior = fotos;
    const novaLista = moverParaCapa(fotos, indice);
    const ok = await persistirNovaOrdem(novaLista, ordemAnterior);
    if (ok) setSucesso("Capa atualizada!");
  }

  async function handleMoverPosicao(indice: number, delta: number) {
    const destino = indice + delta;
    if (destino < 0 || destino >= fotos.length || ocupado) return;

    const ordemAnterior = fotos;
    const novaLista = moverItem(fotos, indice, destino);
    await persistirNovaOrdem(novaLista, ordemAnterior);
  }

  // --- Drag and drop (pointer events: funciona com mouse, caneta e touch) --
  // A miniatura inteira é a área de arraste (exceto os botões, verificados
  // abaixo), e o ponteiro é "capturado" pelo elemento que iniciou o arraste
  // (setPointerCapture), então os eventos de mover/soltar continuam chegando
  // nele mesmo que o ponteiro saia da miniatura durante o gesto.
  function handlePointerDown(evento: ReactPointerEvent<HTMLDivElement>, foto: FotoItem) {
    if (ocupado) return;
    if ((evento.target as HTMLElement).closest("button")) return;

    evento.currentTarget.setPointerCapture(evento.pointerId);
    ordemAntesDoArrasteRef.current = fotos;
    setArrastandoId(foto.id);
  }

  function calcularIndiceMaisProximo(x: number, y: number): number | null {
    let melhorIndice: number | null = null;
    let melhorDistancia = Infinity;

    fotos.forEach((foto, indice) => {
      const elemento = refsMiniaturas.current.get(foto.id);
      if (!elemento) return;

      const retangulo = elemento.getBoundingClientRect();
      const centroX = retangulo.left + retangulo.width / 2;
      const centroY = retangulo.top + retangulo.height / 2;
      const distancia = (centroX - x) ** 2 + (centroY - y) ** 2;

      if (distancia < melhorDistancia) {
        melhorDistancia = distancia;
        melhorIndice = indice;
      }
    });

    return melhorIndice;
  }

  function handlePointerMove(evento: ReactPointerEvent<HTMLDivElement>, fotoId: string) {
    if (arrastandoId !== fotoId) return;

    const indiceAlvo = calcularIndiceMaisProximo(evento.clientX, evento.clientY);
    if (indiceAlvo === null) return;

    setFotos((atual) => {
      const indiceAtual = atual.findIndex((foto) => foto.id === fotoId);
      if (indiceAtual === -1 || indiceAtual === indiceAlvo) return atual;
      return moverItem(atual, indiceAtual, indiceAlvo);
    });
  }

  async function handlePointerUp() {
    if (!arrastandoId) return;

    setArrastandoId(null);

    const ordemAnterior = ordemAntesDoArrasteRef.current;
    const mudou = ordemAnterior.some((foto, indice) => foto.id !== fotos[indice]?.id);
    if (!mudou) return;

    await persistirNovaOrdem(fotos, ordemAnterior);
  }

  function handlePointerCancel() {
    if (arrastandoId) {
      setFotos(ordemAntesDoArrasteRef.current);
    }
    setArrastandoId(null);
  }

  return (
    <div>
      <input
        ref={inputSubstituirRef}
        type="file"
        accept="image/*"
        onChange={handleArquivoSubstituto}
        className="hidden"
        data-testid="input-substituir"
      />

      {fotos.length === 0 ? (
        <p className="font-body text-sm text-navy-400">
          Nenhuma foto enviada ainda.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {fotos.map((foto, indice) => (
            <div
              key={foto.id}
              ref={(elemento) => {
                if (elemento) refsMiniaturas.current.set(foto.id, elemento);
                else refsMiniaturas.current.delete(foto.id);
              }}
              onPointerDown={(evento) => handlePointerDown(evento, foto)}
              onPointerMove={(evento) => handlePointerMove(evento, foto.id)}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              className={`relative touch-none select-none overflow-hidden rounded-xl ring-1 ring-navy-900/10 transition ${
                arrastandoId === foto.id
                  ? "opacity-60 ring-2 ring-gold-400"
                  : "cursor-grab active:cursor-grabbing"
              }`}
              data-testid="foto-item"
              aria-label={`Foto ${indice + 1} de ${fotos.length}${
                indice === 0 ? " (capa)" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urlPublica(foto.url)}
                alt="Foto do imóvel"
                className="h-28 w-full object-cover"
                draggable={false}
              />

              {indice === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-gold-400 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy-900">
                  Capa
                </span>
              )}

              <div className="absolute right-1.5 top-1.5 flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={() => handleExcluir(foto)}
                  disabled={ocupado}
                  className="rounded-full bg-navy-900/80 px-2 py-1 text-xs font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
                >
                  {excluindoId === foto.id ? "..." : "Excluir"}
                </button>
                <button
                  type="button"
                  onClick={() => handleClicarSubstituir(foto)}
                  disabled={ocupado}
                  className="rounded-full bg-navy-900/80 px-2 py-1 text-xs font-medium text-white transition hover:bg-navy-700 disabled:opacity-50"
                >
                  {substituindoId === foto.id ? "..." : "Substituir"}
                </button>
                {indice !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleDefinirCapa(indice)}
                    disabled={ocupado}
                    className="rounded-full bg-navy-900/80 px-2 py-1 text-xs font-medium text-white transition hover:bg-gold-500 hover:text-navy-900 disabled:opacity-50"
                  >
                    Definir capa
                  </button>
                )}
              </div>

              {/* Botões de mover: alternativa acessível/por teclado ao
                  arrastar, e também funcionam em telas menores onde o
                  drag-and-drop é menos confortável. */}
              <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                <button
                  type="button"
                  onClick={() => handleMoverPosicao(indice, -1)}
                  disabled={ocupado || indice === 0}
                  aria-label="Mover foto para a posição anterior"
                  className="rounded-full bg-navy-900/80 px-2 py-1 text-xs font-medium text-white transition hover:bg-navy-700 disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => handleMoverPosicao(indice, 1)}
                  disabled={ocupado || indice === fotos.length - 1}
                  aria-label="Mover foto para a próxima posição"
                  className="rounded-full bg-navy-900/80 px-2 py-1 text-xs font-medium text-white transition hover:bg-navy-700 disabled:opacity-30"
                >
                  →
                </button>
              </div>
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
          data-testid="input-upload"
        />
        <button
          type="button"
          onClick={handleEnviar}
          disabled={ocupado}
          className="rounded-lg bg-navy-800 px-4 py-2 font-body text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
        >
          {enviando
            ? progresso
              ? `Enviando ${progresso.atual} de ${progresso.total}...`
              : "Enviando..."
            : "Enviar fotos"}
        </button>
        {fotos.length > 0 && (
          <button
            type="button"
            onClick={handleExcluirTodas}
            disabled={ocupado}
            className="rounded-lg border border-red-300 px-4 py-2 font-body text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          >
            {excluindoTodas ? "Excluindo..." : "Excluir todas as fotos"}
          </button>
        )}
        {salvandoOrdem && (
          <span className="font-body text-sm text-navy-400">Salvando ordem...</span>
        )}
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
