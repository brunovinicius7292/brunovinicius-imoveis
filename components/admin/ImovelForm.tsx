"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Campo, classesInput } from "@/components/ui/CampoFormulario";
import { Imovel } from "@/lib/types/imovel";
import { ehLinkYoutubeValido } from "@/lib/utils/youtube";
import {
  atualizarImovel,
  criarImovel,
  ImovelFormDados,
} from "@/app/(admin)/admin/imoveis/actions";

export default function ImovelForm({
  modo,
  imovel,
}: {
  modo: "criar" | "editar";
  imovel?: Imovel;
}) {
  const router = useRouter();

  const [codigo, setCodigo] = useState(imovel?.codigo ?? "");
  const [titulo, setTitulo] = useState(imovel?.titulo ?? "");
  const [descricao, setDescricao] = useState(imovel?.descricao ?? "");
  const [finalidade, setFinalidade] = useState<"venda" | "aluguel">(
    imovel?.finalidade ?? "venda"
  );
  const [tipo, setTipo] = useState(imovel?.tipo ?? "");
  const [cidade, setCidade] = useState(imovel?.cidade ?? "");
  const [bairro, setBairro] = useState(imovel?.bairro ?? "");
  const [preco, setPreco] = useState(imovel?.preco?.toString() ?? "");
  const [quartos, setQuartos] = useState(imovel?.quartos?.toString() ?? "0");
  const [banheiros, setBanheiros] = useState(
    imovel?.banheiros?.toString() ?? "0"
  );
  const [vagas, setVagas] = useState(imovel?.vagas?.toString() ?? "0");
  const [areaM2, setAreaM2] = useState(imovel?.areaM2?.toString() ?? "");
  const [destaque, setDestaque] = useState(imovel?.destaque ?? false);
  const [publicado, setPublicado] = useState(imovel?.publicado ?? false);
  const [videoYoutubeUrl, setVideoYoutubeUrl] = useState(
    imovel?.videoYoutubeUrl ?? ""
  );

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSucesso(false);

    if (videoYoutubeUrl && !ehLinkYoutubeValido(videoYoutubeUrl)) {
      setErro(
        "Link do YouTube inválido. Use um link completo (youtube.com/watch?v=...) ou curto (youtu.be/...)."
      );
      return;
    }

    setCarregando(true);

    const dados: ImovelFormDados = {
      codigo,
      titulo,
      descricao,
      finalidade,
      tipo,
      cidade,
      bairro,
      preco: Number(preco) || 0,
      quartos: Number(quartos) || 0,
      banheiros: Number(banheiros) || 0,
      vagas: Number(vagas) || 0,
      areaM2: Number(areaM2) || 0,
      destaque,
      publicado,
      videoYoutubeUrl,
    };

    const resultado =
      modo === "criar"
        ? await criarImovel(dados)
        : await atualizarImovel(imovel!.id, dados);

    setCarregando(false);

    if (!resultado.sucesso) {
      setErro(resultado.erro ?? "Não foi possível salvar o imóvel.");
      return;
    }

    setSucesso(true);
    setTimeout(() => {
      if (modo === "criar" && resultado.id) {
        router.push(`/admin/imoveis/${resultado.id}/editar`);
      } else {
        router.push("/admin/imoveis");
      }
      router.refresh();
    }, 900);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section>
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Informações
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo label="Código">
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className={classesInput}
            />
          </Campo>
          <Campo label="Título" obrigatorio>
            <input
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={classesInput}
            />
          </Campo>
          <Campo label="Descrição" className="sm:col-span-2">
            <textarea
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className={classesInput}
            />
          </Campo>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Classificação
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo label="Finalidade" obrigatorio>
            <select
              value={finalidade}
              onChange={(e) =>
                setFinalidade(e.target.value as "venda" | "aluguel")
              }
              className={classesInput}
            >
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
            </select>
          </Campo>
          <Campo label="Categoria" obrigatorio>
            <input
              required
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              placeholder="Casa, apartamento, terreno..."
              className={classesInput}
            />
          </Campo>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Localização
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo label="Cidade" obrigatorio>
            <input
              required
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className={classesInput}
            />
          </Campo>
          <Campo label="Bairro" obrigatorio>
            <input
              required
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              className={classesInput}
            />
          </Campo>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Valores
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo label="Preço (R$)" obrigatorio>
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              className={classesInput}
            />
          </Campo>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Características
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Campo label="Quartos">
            <input
              type="number"
              min={0}
              value={quartos}
              onChange={(e) => setQuartos(e.target.value)}
              className={classesInput}
            />
          </Campo>
          <Campo label="Banheiros">
            <input
              type="number"
              min={0}
              value={banheiros}
              onChange={(e) => setBanheiros(e.target.value)}
              className={classesInput}
            />
          </Campo>
          <Campo label="Vagas">
            <input
              type="number"
              min={0}
              value={vagas}
              onChange={(e) => setVagas(e.target.value)}
              className={classesInput}
            />
          </Campo>
          <Campo label="Área (m²)" obrigatorio>
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={areaM2}
              onChange={(e) => setAreaM2(e.target.value)}
              className={classesInput}
            />
          </Campo>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Vídeo
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4">
          <Campo label="Vídeo do YouTube">
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
              value={videoYoutubeUrl}
              onChange={(e) => setVideoYoutubeUrl(e.target.value)}
              className={classesInput}
            />
          </Campo>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Opções
        </h2>
        <div className="mt-3 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 font-body text-sm text-navy-700">
            <input
              type="checkbox"
              checked={destaque}
              onChange={(e) => setDestaque(e.target.checked)}
              className="h-4 w-4 rounded border-navy-300 text-gold-500 focus:ring-gold-400"
            />
            Destaque
          </label>
          <label className="flex items-center gap-2 font-body text-sm text-navy-700">
            <input
              type="checkbox"
              checked={publicado}
              onChange={(e) => setPublicado(e.target.checked)}
              className="h-4 w-4 rounded border-navy-300 text-gold-500 focus:ring-gold-400"
            />
            Publicado
          </label>
        </div>
      </section>

      {erro && (
        <p role="alert" className="font-body text-sm text-red-600">
          {erro}
        </p>
      )}
      {sucesso && (
        <p role="status" className="font-body text-sm text-green-600">
          Imóvel salvo com sucesso!
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={carregando}
          className="rounded-lg bg-navy-800 px-6 py-2.5 font-body text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
        >
          {carregando ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/imoveis")}
          className="rounded-lg border border-navy-300 px-6 py-2.5 font-body text-sm font-semibold text-navy-700 transition hover:bg-navy-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
