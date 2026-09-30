"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Finalidade } from "@/lib/types/imovel";

export interface ImovelFormDados {
  codigo: string;
  titulo: string;
  descricao: string;
  finalidade: Finalidade;
  tipo: string;
  cidade: string;
  bairro: string;
  preco: number;
  precoAluguel: number | null;
  quartos: number;
  banheiros: number;
  vagas: number;
  areaM2: number;
  aceitaFinanciamento: boolean;
  destaque: boolean;
  publicado: boolean;
  videoYoutubeUrl: string;
}

export interface ResultadoAcaoImovel {
  sucesso: boolean;
  erro?: string;
  id?: string;
  // Aviso n\u00e3o bloqueante \u2014 usado quando a a\u00e7\u00e3o principal deu certo (ex.: o
  // im\u00f3vel duplicado foi criado) mas uma parte secund\u00e1ria falhou parcialmente
  // (ex.: nem todas as fotos puderam ser copiadas).
  aviso?: string;
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

// Formatos aceitos pelo WhatsApp/navegadores para fotos de im\u00f3vel e o
// tamanho m\u00e1ximo por arquivo \u2014 n\u00e3o havia valida\u00e7\u00e3o de formato/tamanho antes
// desta fun\u00e7\u00e3o (s\u00f3 se o arquivo n\u00e3o estava vazio), ent\u00e3o os limites abaixo
// s\u00e3o uma regra nova, deliberadamente generosa, para n\u00e3o travar upload de
// fotos comuns de celular.
const TIPOS_IMAGEM_ACEITOS = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const TAMANHO_MAXIMO_FOTO_BYTES = 8 * 1024 * 1024; // 8 MB

function validarArquivoFoto(arquivo: File): string | null {
  if (!TIPOS_IMAGEM_ACEITOS.has(arquivo.type)) {
    return `Formato n\u00e3o suportado (${arquivo.type || "desconhecido"}). Envie JPG, PNG, WEBP ou GIF.`;
  }
  if (arquivo.size > TAMANHO_MAXIMO_FOTO_BYTES) {
    return `Arquivo muito grande (m\u00e1x. ${TAMANHO_MAXIMO_FOTO_BYTES / (1024 * 1024)}MB).`;
  }
  return null;
}

// Caminho \u00fanico no Storage para uma nova foto \u2014 reaproveitado pelo upload,
// pela substitui\u00e7\u00e3o e pela c\u00f3pia de fotos na duplica\u00e7\u00e3o de im\u00f3vel.
function caminhoUnicoParaFoto(imovelId: string, nomeArquivo: string) {
  const extensao = nomeArquivo.split(".").pop() || "jpg";
  return `${imovelId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${extensao}`;
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
      preco_aluguel: dados.precoAluguel,
      quartos: dados.quartos,
      banheiros: dados.banheiros,
      vagas: dados.vagas,
      area_m2: dados.areaM2,
      aceita_financiamento: dados.aceitaFinanciamento,
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
      preco_aluguel: dados.precoAluguel,
      quartos: dados.quartos,
      banheiros: dados.banheiros,
      vagas: dados.vagas,
      area_m2: dados.areaM2,
      aceita_financiamento: dados.aceitaFinanciamento,
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

// Duplica um imóvel existente para servir de ponto de partida de um anúncio
// parecido — copia todos os campos do original (inclusive os que não passam
// pelo formulário, como condomínio/IPTU/endereço), exceto:
//   - id/criado_em/atualizado_em: gerados de novo pelo banco.
//   - titulo: recebe o sufixo " (cópia)".
//   - codigo: fica em branco, pra não repetir o código do original.
//   - publicado: sempre começa como rascunho (false), mesmo se o original
//     estivesse publicado.
//   - slug: gerado de novo a partir do título com sufixo.
// As fotos (`imovel_fotos`) TAMBÉM são copiadas (ver duplicarFotos) — cada
// foto vira um arquivo novo no Storage e um registro novo na tabela, então
// editar/excluir/reordenar fotos na cópia nunca afeta o imóvel original.
export async function duplicarImovel(id: string): Promise<ResultadoAcaoImovel> {
  const supabase = createSupabaseServerClient();

  const { data: original, error: erroBusca } = await supabase
    .from("imoveis")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (erroBusca) {
    return { sucesso: false, erro: erroBusca.message };
  }
  if (!original) {
    return { sucesso: false, erro: "Imóvel não encontrado." };
  }

  const {
    id: _id,
    criado_em: _criadoEm,
    atualizado_em: _atualizadoEm,
    slug: _slug,
    codigo: _codigo,
    publicado: _publicado,
    titulo,
    ...restante
  } = original;

  const tituloCopia = `${titulo} (cópia)`;

  const { data: novoImovel, error } = await supabase
    .from("imoveis")
    .insert({
      ...restante,
      titulo: tituloCopia,
      codigo: null,
      publicado: false,
      slug: gerarSlug(tituloCopia, ""),
    })
    .select("id")
    .single();

  if (error) {
    return { sucesso: false, erro: error.message };
  }

  const aviso = await duplicarFotos(supabase, id, novoImovel.id);

  revalidatePath("/admin/imoveis");
  return { sucesso: true, id: novoImovel.id, aviso };
}

// Copia as fotos do imóvel original para a cópia: para cada foto, duplica o
// arquivo no Storage (supabase.storage.copy — cópia no próprio servidor, sem
// baixar/reenviar o arquivo) e cria um registro novo em `imovel_fotos` com a
// mesma `ordem`. Cópia e original ficam com arquivos e registros totalmente
// independentes a partir daqui. Se uma foto específica falhar ao copiar, as
// demais continuam normalmente e isso vira um aviso não bloqueante — o
// imóvel duplicado já foi criado com sucesso de qualquer forma.
async function duplicarFotos(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  imovelOrigemId: string,
  imovelDestinoId: string
): Promise<string | undefined> {
  const { data: fotosOriginais, error: erroFotos } = await supabase
    .from("imovel_fotos")
    .select("url, ordem")
    .eq("imovel_id", imovelOrigemId)
    .order("ordem", { ascending: true });

  if (erroFotos) {
    return "Imóvel duplicado, mas não foi possível copiar as fotos do original.";
  }
  if (!fotosOriginais || fotosOriginais.length === 0) {
    return undefined;
  }

  let falhas = 0;

  for (const foto of fotosOriginais) {
    const novoCaminho = caminhoUnicoParaFoto(imovelDestinoId, foto.url);

    const { error: erroCopia } = await supabase.storage
      .from("imoveis")
      .copy(foto.url, novoCaminho);

    if (erroCopia) {
      falhas += 1;
      continue;
    }

    const { error: erroInsercao } = await supabase.from("imovel_fotos").insert({
      imovel_id: imovelDestinoId,
      url: novoCaminho,
      ordem: foto.ordem,
    });

    if (erroInsercao) {
      falhas += 1;
    }
  }

  if (falhas > 0) {
    return `${falhas} de ${fotosOriginais.length} foto(s) não puderam ser copiadas para a cópia.`;
  }

  return undefined;
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

  for (const arquivo of arquivosValidos) {
    const erroValidacao = validarArquivoFoto(arquivo);
    if (erroValidacao) {
      return { sucesso: false, erro: `"${arquivo.name}": ${erroValidacao}` };
    }
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
    const caminho = caminhoUnicoParaFoto(imovelId, arquivo.name);

    const { error: erroUpload } = await supabase.storage
      .from("imoveis")
      .upload(caminho, arquivo, {
        contentType: arquivo.type,
        // Fotos de imóveis raramente mudam depois de enviadas — cache de 1
        // ano reduz o egress do Supabase para quem já visitou o site.
        cacheControl: "31536000",
      });

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

// Remove todas as fotos de um imóvel de uma vez (Storage + tabela) — usado
// pelo botão "Excluir todas as fotos" do painel. Não apaga o imóvel, só as
// fotos associadas a ele.
export async function excluirTodasFotos(
  imovelId: string
): Promise<ResultadoAcaoImovel> {
  const supabase = createSupabaseServerClient();

  const { data: fotos, error: erroConsulta } = await supabase
    .from("imovel_fotos")
    .select("url")
    .eq("imovel_id", imovelId);

  if (erroConsulta) {
    return { sucesso: false, erro: erroConsulta.message };
  }

  const caminhos = (fotos ?? []).map((foto: { url: string }) => foto.url);

  if (caminhos.length > 0) {
    const { error: erroStorage } = await supabase.storage
      .from("imoveis")
      .remove(caminhos);

    if (erroStorage) {
      return { sucesso: false, erro: erroStorage.message };
    }
  }

  const { error: erroTabela } = await supabase
    .from("imovel_fotos")
    .delete()
    .eq("imovel_id", imovelId);

  if (erroTabela) {
    return { sucesso: false, erro: erroTabela.message };
  }

  revalidatePath(`/admin/imoveis/${imovelId}/editar`);
  return { sucesso: true };
}

// Substitui o arquivo de uma foto existente, mantendo o mesmo registro (id)
// e a mesma posição (`ordem`) — assim a substituição não bagunça a
// ordenação nem a capa. Sobe o arquivo novo antes de apagar o antigo do
// Storage, para não deixar a foto "sumida" caso algo falhe no meio do
// caminho; se a atualização da tabela falhar, desfaz o upload novo.
export async function substituirFoto(
  fotoId: string,
  imovelId: string,
  caminhoAntigo: string,
  formData: FormData
): Promise<ResultadoFotos> {
  const arquivo = formData.get("foto");

  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { sucesso: false, erro: "Selecione uma foto." };
  }

  const erroValidacao = validarArquivoFoto(arquivo);
  if (erroValidacao) {
    return { sucesso: false, erro: erroValidacao };
  }

  const supabase = createSupabaseServerClient();
  const novoCaminho = caminhoUnicoParaFoto(imovelId, arquivo.name);

  const { error: erroUpload } = await supabase.storage
    .from("imoveis")
    .upload(novoCaminho, arquivo, {
      contentType: arquivo.type,
      cacheControl: "31536000",
    });

  if (erroUpload) {
    return { sucesso: false, erro: erroUpload.message };
  }

  const { data: fotoAtualizada, error: erroAtualizacao } = await supabase
    .from("imovel_fotos")
    .update({ url: novoCaminho })
    .eq("id", fotoId)
    .select("id, url")
    .single();

  if (erroAtualizacao) {
    await supabase.storage.from("imoveis").remove([novoCaminho]);
    return { sucesso: false, erro: erroAtualizacao.message };
  }

  await supabase.storage.from("imoveis").remove([caminhoAntigo]);

  revalidatePath(`/admin/imoveis/${imovelId}/editar`);
  return { sucesso: true, fotos: [fotoAtualizada] };
}

// Persiste a nova ordem das fotos definida por drag-and-drop (ou pelos
// botões de mover/definir capa) no painel — `idsEmOrdem` é a lista de ids na
// ordem final desejada; a posição de cada id no array vira o novo valor de
// `ordem`. A foto da posição 0 passa a ser a capa (mesma convenção usada em
// todo o projeto: capa = foto de menor `ordem`).
export async function reordenarFotos(
  imovelId: string,
  idsEmOrdem: string[]
): Promise<ResultadoAcaoImovel> {
  const supabase = createSupabaseServerClient();

  const atualizacoes = await Promise.all(
    idsEmOrdem.map((fotoId, indice) =>
      supabase
        .from("imovel_fotos")
        .update({ ordem: indice })
        .eq("id", fotoId)
        .eq("imovel_id", imovelId)
    )
  );

  const comErro = atualizacoes.find((resultado) => resultado.error);
  if (comErro?.error) {
    return { sucesso: false, erro: comErro.error.message };
  }

  revalidatePath(`/admin/imoveis/${imovelId}/editar`);
  return { sucesso: true };
}
