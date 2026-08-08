// Migração única: redimensiona (máx. 1600px) e recomprime as fotos que já
// estão no Supabase Storage, com o mesmo parâmetro de qualidade usado no
// upload de fotos novas (GerenciadorFotos.tsx) — reduz o tamanho de fotos
// antigas e aplica o Cache-Control de 1 ano nelas.
//
// NÃO sobrescreve os arquivos originais: sobe a versão recomprimida num
// caminho novo, atualiza `imovel_fotos.url` para apontar pra ela, e mantém o
// arquivo antigo no Storage (para rollback fácil) até você confirmar que
// está tudo certo e rodar a limpeza com --apagar-manifesto.
//
// COMO USAR
//   1) Relatório sem escrever nada (baixa e recomprime em memória só pra medir):
//        SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/recomprimir-fotos.mjs --dry-run
//
//   2) Amostra real (1-2 imóveis) pra validar qualidade/rotação visualmente:
//        SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/recomprimir-fotos.mjs --imovel=<id-do-imovel>
//
//   3) Rodada completa (depois de validar a amostra):
//        SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/recomprimir-fotos.mjs
//
//   4) Só depois de confirmar em produção que está tudo bem (dias depois),
//      apagar os originais substituídos, usando o manifesto gerado no passo 3:
//        SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/recomprimir-fotos.mjs --apagar-manifesto=scripts/manifestos/recompressao-2026-08-08T12-00-00.json
//
// A SUPABASE_SERVICE_ROLE_KEY fica em Project Settings > API no painel do
// Supabase. Nunca commitar essa chave — passe só como variável de ambiente
// na hora de rodar.

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { writeFile, mkdir, readFile as readFileAsync } from "node:fs/promises";
import path from "node:path";

// Node puro não carrega .env.local sozinho (isso é um recurso do Next.js) —
// lê manualmente aqui pra não precisar exportar NEXT_PUBLIC_SUPABASE_URL na
// mão toda vez. Só preenche o que ainda não estiver definido no ambiente.
async function carregarEnvLocal() {
  try {
    const conteudo = await readFileAsync(".env.local", "utf8");
    for (const linha of conteudo.split("\n")) {
      const linhaLimpa = linha.trim();
      if (!linhaLimpa || linhaLimpa.startsWith("#")) continue;
      const igual = linhaLimpa.indexOf("=");
      if (igual === -1) continue;
      const chave = linhaLimpa.slice(0, igual).trim();
      const valor = linhaLimpa.slice(igual + 1).trim().replace(/^["']|["']$/g, "");
      if (chave && process.env[chave] === undefined) {
        process.env[chave] = valor;
      }
    }
  } catch {
    // sem .env.local no diretório atual — segue só com o que já estiver no ambiente
  }
}

await carregarEnvLocal();

const BUCKET = "imoveis";
const LARGURA_MAXIMA = 1600;
const QUALIDADE = 80; // mesmo valor usado em GerenciadorFotos.tsx (initialQuality: 0.8)
const PREFIXO_RECOMPRIMIDA = "recomprimida-";

const args = process.argv.slice(2);
const modoDryRun = args.includes("--dry-run");
const argImovel = args.find((a) => a.startsWith("--imovel="));
const imovelFiltro = argImovel ? argImovel.split("=")[1] : null;
const argApagar = args.find((a) => a.startsWith("--apagar-manifesto="));
const manifestoParaApagar = argApagar ? argApagar.split("=")[1] : null;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  if (!SUPABASE_URL) {
    console.error("Faltou NEXT_PUBLIC_SUPABASE_URL (verifique se .env.local existe na raiz do projeto).");
  }
  if (!SERVICE_ROLE_KEY) {
    console.error(
      "Faltou SUPABASE_SERVICE_ROLE_KEY — pegue em Project Settings > API no painel do Supabase e passe como variável de ambiente (não commite): SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/recomprimir-fotos.mjs ..."
    );
  }
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function kb(bytes) {
  return (bytes / 1024).toFixed(0);
}

async function recomprimir(bytesOriginais) {
  const imagem = sharp(bytesOriginais);
  const metadata = await imagem.metadata();
  const formato = metadata.format === "png" ? "png" : "jpeg";

  let pipeline = imagem
    .rotate() // aplica a orientação EXIF antes de redimensionar
    .resize({
      width: LARGURA_MAXIMA,
      height: LARGURA_MAXIMA,
      fit: "inside",
      withoutEnlargement: true,
    });

  pipeline =
    formato === "png"
      ? pipeline.png({ compressionLevel: 9 })
      : pipeline.jpeg({ quality: QUALIDADE, mozjpeg: true });

  const buffer = await pipeline.toBuffer();
  const extensao = formato === "png" ? "png" : "jpg";
  const contentType = formato === "png" ? "image/png" : "image/jpeg";

  return { buffer, extensao, contentType };
}

async function apagarOriginaisDoManifesto(caminhoManifesto) {
  const { readFile } = await import("node:fs/promises");
  const conteudo = JSON.parse(await readFile(caminhoManifesto, "utf8"));

  console.log(`Apagando ${conteudo.length} arquivo(s) original(is) listados em ${caminhoManifesto}...`);

  const caminhos = conteudo.map((item) => item.caminhoAntigo);
  const { error } = await supabase.storage.from(BUCKET).remove(caminhos);

  if (error) {
    console.error("Erro ao apagar originais:", error.message);
    process.exit(1);
  }

  console.log("Originais apagados com sucesso.");
}

async function main() {
  if (manifestoParaApagar) {
    await apagarOriginaisDoManifesto(manifestoParaApagar);
    return;
  }

  let query = supabase
    .from("imovel_fotos")
    .select("id, imovel_id, url, ordem")
    .order("imovel_id", { ascending: true });

  if (imovelFiltro) {
    query = query.eq("imovel_id", imovelFiltro);
  }

  const { data: fotos, error } = await query;

  if (error) {
    console.error("Erro ao listar fotos:", error.message);
    process.exit(1);
  }

  const pendentes = fotos.filter(
    (foto) => !foto.url.includes(`/${PREFIXO_RECOMPRIMIDA}`) && !foto.url.startsWith(PREFIXO_RECOMPRIMIDA)
  );

  console.log(
    `${fotos.length} foto(s) encontradas, ${pendentes.length} pendente(s) de recompressão (${fotos.length - pendentes.length} já processada(s) antes).`
  );
  if (modoDryRun) console.log("Modo --dry-run: nada será escrito no Storage nem no banco.\n");

  const manifesto = [];
  let totalAntes = 0;
  let totalDepois = 0;
  let falhas = 0;

  for (const [indice, foto] of pendentes.entries()) {
    process.stdout.write(`[${indice + 1}/${pendentes.length}] ${foto.url} ... `);

    try {
      const { data: arquivoOriginal, error: erroDownload } = await supabase.storage
        .from(BUCKET)
        .download(foto.url);

      if (erroDownload) throw new Error(`download: ${erroDownload.message}`);

      const bytesOriginais = Buffer.from(await arquivoOriginal.arrayBuffer());
      const { buffer, extensao, contentType } = await recomprimir(bytesOriginais);

      totalAntes += bytesOriginais.length;
      totalDepois += buffer.length;

      const reducaoPct = Math.round((1 - buffer.length / bytesOriginais.length) * 100);
      console.log(`${kb(bytesOriginais.length)}KB -> ${kb(buffer.length)}KB (-${reducaoPct}%)`);

      if (modoDryRun) continue;

      const novoCaminho = `${foto.imovel_id}/${PREFIXO_RECOMPRIMIDA}${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${extensao}`;

      const { error: erroUpload } = await supabase.storage
        .from(BUCKET)
        .upload(novoCaminho, buffer, { contentType, cacheControl: "31536000" });

      if (erroUpload) throw new Error(`upload: ${erroUpload.message}`);

      const { error: erroUpdate } = await supabase
        .from("imovel_fotos")
        .update({ url: novoCaminho })
        .eq("id", foto.id);

      if (erroUpdate) throw new Error(`update db: ${erroUpdate.message}`);

      manifesto.push({
        fotoId: foto.id,
        imovelId: foto.imovel_id,
        caminhoAntigo: foto.url,
        caminhoNovo: novoCaminho,
        bytesAntes: bytesOriginais.length,
        bytesDepois: buffer.length,
      });
    } catch (excecao) {
      falhas += 1;
      console.log(`FALHOU (${excecao.message})`);
    }
  }

  console.log("\n--- Resumo ---");
  console.log(`Processadas: ${pendentes.length - falhas}, falhas: ${falhas}`);
  if (totalAntes > 0) {
    const reducaoTotalPct = Math.round((1 - totalDepois / totalAntes) * 100);
    console.log(
      `Total antes: ${(totalAntes / 1024 / 1024).toFixed(1)}MB, depois: ${(totalDepois / 1024 / 1024).toFixed(1)}MB (-${reducaoTotalPct}%)`
    );
  }

  if (!modoDryRun && manifesto.length > 0) {
    const dirManifestos = path.join("scripts", "manifestos");
    await mkdir(dirManifestos, { recursive: true });
    const nomeArquivo = `recompressao-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    const caminhoManifesto = path.join(dirManifestos, nomeArquivo);
    await writeFile(caminhoManifesto, JSON.stringify(manifesto, null, 2));
    console.log(`\nManifesto salvo em ${caminhoManifesto}.`);
    console.log(
      "Guarde esse arquivo — ele é o que permite apagar os originais depois, com --apagar-manifesto=<caminho>."
    );
  }
}

main();
