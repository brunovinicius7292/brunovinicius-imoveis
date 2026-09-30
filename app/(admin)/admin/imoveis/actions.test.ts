import { beforeEach, describe, expect, it, vi } from "vitest";
import { criarSupabaseFake, type SupabaseFake } from "../../../../test/fakeSupabaseClient";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  duplicarImovel,
  enviarFotos,
  excluirFoto,
  excluirTodasFotos,
  reordenarFotos,
  substituirFoto,
} from "./actions";

function arquivoFalso(nome: string, tipo = "image/jpeg", tamanhoBytes = 1024): File {
  return new File([new Uint8Array(tamanhoBytes)], nome, { type: tipo });
}

let fake: SupabaseFake;

beforeEach(() => {
  fake = criarSupabaseFake();
  vi.mocked(createSupabaseServerClient).mockReturnValue(fake.client as any);
});

describe("enviarFotos", () => {
  it("envia várias fotos de uma vez e cria uma foto por arquivo, em ordem crescente", async () => {
    const formData = new FormData();
    formData.set("imovelId", "imovel-1");
    formData.append("fotos", arquivoFalso("a.jpg"));
    formData.append("fotos", arquivoFalso("b.jpg"));

    const resultado = await enviarFotos(formData);

    expect(resultado.sucesso).toBe(true);
    expect(resultado.fotos).toHaveLength(2);
    expect(fake.db.imovel_fotos).toHaveLength(2);
    expect(fake.db.imovel_fotos[0].ordem).toBe(0);
    expect(fake.db.imovel_fotos[1].ordem).toBe(1);
    expect(fake.storage.upload).toHaveBeenCalledTimes(2);
  });

  it("continua a numeração da ordem a partir da última foto já existente", async () => {
    fake.db.imovel_fotos.push({ id: "f0", imovel_id: "imovel-1", url: "x", ordem: 4 });

    const formData = new FormData();
    formData.set("imovelId", "imovel-1");
    formData.append("fotos", arquivoFalso("nova.jpg"));

    await enviarFotos(formData);

    const novaFoto = fake.db.imovel_fotos.find((f) => f.url !== "x");
    expect(novaFoto?.ordem).toBe(5);
  });

  it("rejeita formato de arquivo não suportado", async () => {
    const formData = new FormData();
    formData.set("imovelId", "imovel-1");
    formData.append("fotos", arquivoFalso("documento.pdf", "application/pdf"));

    const resultado = await enviarFotos(formData);

    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro).toMatch(/formato/i);
    expect(fake.db.imovel_fotos).toHaveLength(0);
  });

  it("rejeita arquivo maior que o limite permitido", async () => {
    const formData = new FormData();
    formData.set("imovelId", "imovel-1");
    formData.append("fotos", arquivoFalso("grande.jpg", "image/jpeg", 9 * 1024 * 1024));

    const resultado = await enviarFotos(formData);

    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro).toMatch(/grande/i);
  });

  it("propaga erro de upload do Storage sem criar registro na tabela", async () => {
    fake.storage.upload.mockResolvedValueOnce({
      data: null,
      error: { message: "Falha de rede simulada" },
    });

    const formData = new FormData();
    formData.set("imovelId", "imovel-1");
    formData.append("fotos", arquivoFalso("a.jpg"));

    const resultado = await enviarFotos(formData);

    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro).toBe("Falha de rede simulada");
    expect(fake.db.imovel_fotos).toHaveLength(0);
  });
});

describe("excluirFoto", () => {
  it("remove o arquivo do Storage e o registro da tabela", async () => {
    fake.db.imovel_fotos.push({ id: "f1", imovel_id: "imovel-1", url: "imovel-1/a.jpg", ordem: 0 });

    const resultado = await excluirFoto("f1", "imovel-1/a.jpg");

    expect(resultado.sucesso).toBe(true);
    expect(fake.storage.remove).toHaveBeenCalledWith(["imovel-1/a.jpg"]);
    expect(fake.db.imovel_fotos).toHaveLength(0);
  });
});

describe("excluirTodasFotos", () => {
  it("remove todas as fotos do imóvel de uma vez, sem afetar outro imóvel", async () => {
    fake.db.imovel_fotos.push(
      { id: "f1", imovel_id: "imovel-1", url: "imovel-1/a.jpg", ordem: 0 },
      { id: "f2", imovel_id: "imovel-1", url: "imovel-1/b.jpg", ordem: 1 },
      { id: "f3", imovel_id: "imovel-2", url: "imovel-2/c.jpg", ordem: 0 }
    );

    const resultado = await excluirTodasFotos("imovel-1");

    expect(resultado.sucesso).toBe(true);
    expect(fake.storage.remove).toHaveBeenCalledWith(["imovel-1/a.jpg", "imovel-1/b.jpg"]);
    expect(fake.db.imovel_fotos).toHaveLength(1);
    expect(fake.db.imovel_fotos[0].imovel_id).toBe("imovel-2");
  });

  it("não falha quando o imóvel já não tem fotos", async () => {
    const resultado = await excluirTodasFotos("imovel-sem-fotos");
    expect(resultado.sucesso).toBe(true);
    expect(fake.storage.remove).not.toHaveBeenCalled();
  });
});

describe("substituirFoto", () => {
  it("troca o arquivo mantendo o mesmo id e a mesma ordem", async () => {
    fake.db.imovel_fotos.push({
      id: "f1",
      imovel_id: "imovel-1",
      url: "imovel-1/antiga.jpg",
      ordem: 2,
    });

    const formData = new FormData();
    formData.set("foto", arquivoFalso("nova.jpg"));

    const resultado = await substituirFoto("f1", "imovel-1", "imovel-1/antiga.jpg", formData);

    expect(resultado.sucesso).toBe(true);
    expect(resultado.fotos?.[0].id).toBe("f1");
    expect(resultado.fotos?.[0].url).not.toBe("imovel-1/antiga.jpg");
    expect(fake.db.imovel_fotos[0].ordem).toBe(2);
    expect(fake.storage.remove).toHaveBeenCalledWith(["imovel-1/antiga.jpg"]);
  });

  it("desfaz o upload novo se a atualização da tabela falhar", async () => {
    // Nenhuma foto com id "inexistente" no banco fake — o update não encontra
    // alvo e o builder retorna erro de "single" (comportamento igual ao
    // Supabase real quando .single() não encontra nenhuma linha).
    const formData = new FormData();
    formData.set("foto", arquivoFalso("nova.jpg"));

    const resultado = await substituirFoto("inexistente", "imovel-1", "imovel-1/antiga.jpg", formData);

    expect(resultado.sucesso).toBe(false);
    expect(fake.storage.upload).toHaveBeenCalledTimes(1);
    // O caminho novo (o único argumento de remove após a falha) deve ter sido
    // revertido — chamado com o mesmo caminho passado ao upload.
    const caminhoEnviado = fake.storage.upload.mock.calls[0][0];
    expect(fake.storage.remove).toHaveBeenCalledWith([caminhoEnviado]);
  });
});

describe("reordenarFotos (drag-and-drop / definir capa)", () => {
  it("persiste a ordem final e faz a primeira foto da lista virar a capa (ordem 0)", async () => {
    fake.db.imovel_fotos.push(
      { id: "f1", imovel_id: "imovel-1", url: "a", ordem: 0 },
      { id: "f2", imovel_id: "imovel-1", url: "b", ordem: 1 },
      { id: "f3", imovel_id: "imovel-1", url: "c", ordem: 2 }
    );

    // Usuário arrastou "f3" para o início — define f3 como nova capa.
    const resultado = await reordenarFotos("imovel-1", ["f3", "f1", "f2"]);

    expect(resultado.sucesso).toBe(true);
    const porId = Object.fromEntries(fake.db.imovel_fotos.map((f) => [f.id, f.ordem]));
    expect(porId).toEqual({ f3: 0, f1: 1, f2: 2 });
  });

  it("não deixa uma foto de outro imóvel ser reordenada por engano", async () => {
    fake.db.imovel_fotos.push(
      { id: "f1", imovel_id: "imovel-1", url: "a", ordem: 0 },
      { id: "f9", imovel_id: "imovel-2", url: "z", ordem: 0 }
    );

    await reordenarFotos("imovel-1", ["f9"]);

    const fotoDeOutroImovel = fake.db.imovel_fotos.find((f) => f.id === "f9");
    expect(fotoDeOutroImovel?.ordem).toBe(0); // não mudou, porque o imovel_id não bateu
  });
});

describe("duplicarImovel", () => {
  beforeEach(() => {
    fake.db.imoveis.push({
      id: "original-1",
      titulo: "Casa na praia",
      codigo: "COD-1",
      publicado: true,
      slug: "casa-na-praia-cod-1",
      criado_em: "2026-01-01",
      atualizado_em: "2026-01-01",
      preco: 500000,
    });
    fake.db.imovel_fotos.push(
      { id: "foto-1", imovel_id: "original-1", url: "original-1/capa.jpg", ordem: 0 },
      { id: "foto-2", imovel_id: "original-1", url: "original-1/sala.jpg", ordem: 1 }
    );
  });

  it("cria um imóvel novo e independente, copiando os dados (exceto código/slug/publicado)", async () => {
    const resultado = await duplicarImovel("original-1");

    expect(resultado.sucesso).toBe(true);
    expect(resultado.id).toBeDefined();
    expect(resultado.id).not.toBe("original-1");

    const copia = fake.db.imoveis.find((i) => i.id === resultado.id);
    expect(copia?.titulo).toBe("Casa na praia (cópia)");
    expect(copia?.codigo).toBeNull();
    expect(copia?.publicado).toBe(false);
    expect(copia?.preco).toBe(500000);
  });

  it("copia as fotos do original para a cópia, com arquivos de Storage independentes", async () => {
    const resultado = await duplicarImovel("original-1");
    const novoId = resultado.id!;

    const fotosDaCopia = fake.db.imovel_fotos.filter((f) => f.imovel_id === novoId);
    expect(fotosDaCopia).toHaveLength(2);
    expect(fotosDaCopia.map((f) => f.ordem).sort()).toEqual([0, 1]);

    // Cada foto da cópia deve apontar para um caminho de Storage diferente do
    // original (arquivo copiado, não referência compartilhada).
    const caminhosOriginais = new Set(["original-1/capa.jpg", "original-1/sala.jpg"]);
    fotosDaCopia.forEach((foto) => {
      expect(caminhosOriginais.has(foto.url)).toBe(false);
    });
    expect(fake.storage.copy).toHaveBeenCalledTimes(2);
  });

  it("editar/excluir fotos da cópia não altera as fotos do imóvel original", async () => {
    const resultado = await duplicarImovel("original-1");
    const novoId = resultado.id!;

    const fotosOriginaisAntes = fake.db.imovel_fotos.filter((f) => f.imovel_id === "original-1");
    expect(fotosOriginaisAntes).toHaveLength(2);

    // Exclui TODAS as fotos da cópia.
    await excluirTodasFotos(novoId);

    const fotosDaCopiaDepois = fake.db.imovel_fotos.filter((f) => f.imovel_id === novoId);
    const fotosOriginaisDepois = fake.db.imovel_fotos.filter((f) => f.imovel_id === "original-1");

    expect(fotosDaCopiaDepois).toHaveLength(0);
    expect(fotosOriginaisDepois).toHaveLength(2); // original intacto
  });

  it("reordenar a cópia não altera a ordem das fotos do original", async () => {
    const resultado = await duplicarImovel("original-1");
    const novoId = resultado.id!;

    const fotosDaCopia = fake.db.imovel_fotos.filter((f) => f.imovel_id === novoId);
    const idsInvertidos = [...fotosDaCopia].reverse().map((f) => f.id);

    await reordenarFotos(novoId, idsInvertidos);

    const ordemOriginal = fake.db.imovel_fotos
      .filter((f) => f.imovel_id === "original-1")
      .sort((a, b) => a.ordem - b.ordem)
      .map((f) => f.id);

    expect(ordemOriginal).toEqual(["foto-1", "foto-2"]); // original continua na ordem de sempre
  });

  it("segue duplicando o imóvel mesmo se uma foto falhar ao copiar, retornando um aviso", async () => {
    fake.storage.copy
      .mockResolvedValueOnce({ data: null, error: { message: "falhou" } })
      .mockResolvedValueOnce({ data: { path: "ok" }, error: null });

    const resultado = await duplicarImovel("original-1");

    expect(resultado.sucesso).toBe(true);
    expect(resultado.aviso).toMatch(/1 de 2/);

    const fotosDaCopia = fake.db.imovel_fotos.filter((f) => f.imovel_id === resultado.id);
    expect(fotosDaCopia).toHaveLength(1); // só a que copiou com sucesso
  });

  it("imóvel sem fotos duplica normalmente, sem aviso", async () => {
    fake.db.imoveis.push({
      id: "sem-fotos",
      titulo: "Terreno vazio",
      codigo: null,
      publicado: false,
      slug: "terreno-vazio",
    });

    const resultado = await duplicarImovel("sem-fotos");

    expect(resultado.sucesso).toBe(true);
    expect(resultado.aviso).toBeUndefined();
  });
});
