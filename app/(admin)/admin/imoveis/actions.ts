"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ImovelFormDados {
  codigo: string;
  titulo: string;
  descricao: string;
  finalidade: "venda" | "aluguel";
  tipo: string;
  cidade: string;
  bairro: string;
  preco: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  areaM2: number;
  destaque: boolean;
  publicado: boolean;
  videoYoutubeUrl: string;
}

export interface ResultadoAcaoImovel {
  sucesso: boolean;
  erro?: string;
  id?: string;
}

export interface ResultadoFotos {
  sucesso: boolean;
  erro?: string;
  fotos?: { id: string; url: string }[];
}

function gerarSlug(titulo: string, codigo: string) {
  const base = `${titulo}-${codigo || ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");

  return `${base || "imovel"}-${Date.now().toString(36)}`;
}

export async function criarImovel(
  dados: ImovelFormDados
): Promise<ResultadoAcaoImovel> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("imoveis")
    .insert({
      codigo: dados.codigo || null,
      titulo: dados.titulo,
      descricao: dados.descricao || null,
      finalidade: dados.finalidade,
      tipo: dados.tipo,
      cidade: dados.cidade,
      bairro: dados.bairro,
      preco: dados.preco,
      quartos: dados.quartos,
      banheiros: dados.banheiros,
      vagas: dados.vagas,
      area_m2: dados.areaM2,
      destaque: dados.destaque,
      publicado: dados.publicado,
      video_youtube_url: dados.videoYoutubeUrl || null,
      slug: gerarSlug(dados.titulo, dados.codigo),
    })
    .select("id")
    .single();

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/admin/imoveis");
  return { sucesso: true, id: data.id };
}

export async function atualizarImovel(
  id: string,
  dados: ImovelFormDados
): Promise<ResultadoAcaoImovel> {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from("imoveis")
    .update({
      codigo: dados.codigo || null,
      titulo: dados.titulo,
      descricao: dados.descricao || null,
      finalidade: dados.finalidade,
      tipo: dados.tipo,
      cidade: dados.cidade,
      bairro: dados.bairro,
      preco: dados.preco,
      quartos: dados.quartos,
      banheiros: dados.banheiros,
      vagas: dados.vagas,
      area_m2: dados.areaM2,
      destaque: dados.destaque,
      publicado: dados.publicado,
      video_youtube_url: dados.videoYoutubeUrl || null,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/admin/imoveis");
  return { sucesso: true };
}

export async function excluirImovel(id: string): Promise<ResultadoAcaoImovel> {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from("imoveis").delete().eq("id", id);

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/admin/imoveis");
  return { sucesso: true };
}

// Envia uma ou mais fotos para o bucket "imoveis" no Storage e registra os
// caminhos na tabela `imovel_fotos`. A primeira foto de um imóvel recebe a
// menor `ordem` e, por isso, funciona como capa (mesma lógica já usada pela
// Galeria da página pública).
export async function enviarFotos(formData: FormData): Promise<ResultadoFotos> {
  const imovelId = formData.get("imovelId");
  const arquivos = formData.getAll("fotos");

  if (typeof imovelId !== "string" || !imovelId) {
    return { sucesso: false, erro: "Imóvel inválido." };
  }

  const arquivosValidos = arquivos.filter(
    (arquivo): arquivo is File => arquivo instanceof File && arquivo.size > 0
  );

  if (arquivosValidos.length === 0) {
    return { sucesso: false, erro: "Nenhuma foto selecionada." };
  }

  const supabase = createSupabaseServerClient();

  const { data: ultimaFoto, error: erroConsulta } = await supabase
    .from("imovel_fotos")
    .select("ordem")
    .eq("imovel_id", imovelId)
    .order("ordem", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (erroConsulta) {
    return { sucesso: false, erro: erroConsulta.message };
  }

  let proximaOrdem = ultimaFoto ? ultimaFoto.ordem + 1 : 0;
  const fotosSalvas: { id: string; url: string }[] = [];

  for (const arquivo of arquivosValidos) {
    const extensao = arquivo.name.split(".").pop() || "jpg";
    const caminho = `${imovelId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extensao}`;

    const { error: erroUpload } = await supabase.storage
      .from("imoveis")
      .upload(caminho, arquivo, { contentType: arquivo.type });

    if (erroUpload) {
      return { sucesso: false, erro: erroUpload.message };
    }

    const { data: fotoInserida, error: erroInsercao } = await supabase
      .from("imovel_fotos")
      .insert({ imovel_id: imovelId, url: caminho, ordem: proximaOrdem })
      .select("id, url")
      .single();

    if (erroInsercao) {
      return { sucesso: false, erro: erroInsercao.message };
    }

    fotosSalvas.push(fotoInserida);
    proximaOrdem += 1;
  }

  revalidatePath(`/admin/imoveis/${imovelId}/editar`);
  return { sucesso: true, fotos: fotosSalvas };
}

// Remove uma foto do Storage e o registro correspondente em `imovel_fotos`.
export async function excluirFoto(
  fotoId: string,
  caminho: string
): Promise<ResultadoAcaoImovel> {
  const supabase = createSupabaseServerClient();

  const { error: erroStorage } = await supabase.storage
    .from("imoveis")
    .remove([caminho]);

  if (erroStorage) {
    return { sucesso: false, erro: erroStorage.message };
  }

  const { error: erroTabela } = await supabase
    .from("imovel_fotos")
    .delete()
    .eq("id", fotoId);

  if (erroTabela) {
    return { sucesso: false, erro: erroTabela.message };
  }

  return { sucesso: true };
}
