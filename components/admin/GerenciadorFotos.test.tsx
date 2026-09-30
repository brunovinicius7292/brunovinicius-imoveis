import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GerenciadorFotos from "./GerenciadorFotos";
import {
  enviarFotos,
  excluirFoto,
  excluirTodasFotos,
  reordenarFotos,
  substituirFoto,
} from "@/app/(admin)/admin/imoveis/actions";

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    storage: {
      from: () => ({
        getPublicUrl: (caminho: string) => ({
          data: { publicUrl: `https://fake.test/${caminho}` },
        }),
      }),
    },
  }),
}));

vi.mock("@/app/(admin)/admin/imoveis/actions", () => ({
  enviarFotos: vi.fn(),
  excluirFoto: vi.fn(),
  excluirTodasFotos: vi.fn(),
  reordenarFotos: vi.fn(),
  substituirFoto: vi.fn(),
}));

const fotosIniciais = [
  { id: "f1", url: "imovel-1/a.jpg" },
  { id: "f2", url: "imovel-1/b.jpg" },
];

function arquivo(nome = "nova.jpg") {
  return new File(["conteudo"], nome, { type: "image/jpeg" });
}

beforeEach(() => {
  vi.mocked(enviarFotos).mockReset();
  vi.mocked(excluirFoto).mockReset();
  vi.mocked(excluirTodasFotos).mockReset();
  vi.mocked(reordenarFotos).mockReset();
  vi.mocked(substituirFoto).mockReset();
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GerenciadorFotos", () => {
  it("mostra a mensagem de vazio quando o imóvel não tem fotos", () => {
    render(<GerenciadorFotos imovelId="imovel-1" fotosIniciais={[]} />);
    expect(screen.getByText("Nenhuma foto enviada ainda.")).toBeInTheDocument();
  });

  it("a primeira foto da lista é exibida como capa", () => {
    render(<GerenciadorFotos imovelId="imovel-1" fotosIniciais={fotosIniciais} />);
    const itens = screen.getAllByTestId("foto-item");
    expect(within(itens[0]).getByText("Capa")).toBeInTheDocument();
    expect(within(itens[1]).queryByText("Capa")).not.toBeInTheDocument();
  });

  it("envia uma foto nova e adiciona à lista sem perder as existentes", async () => {
    const usuario = userEvent.setup();
    vi.mocked(enviarFotos).mockResolvedValue({
      sucesso: true,
      fotos: [{ id: "f3", url: "imovel-1/c.jpg" }],
    });

    render(<GerenciadorFotos imovelId="imovel-1" fotosIniciais={fotosIniciais} />);

    const inputUpload = screen.getByTestId("input-upload");
    await usuario.upload(inputUpload, arquivo());
    await usuario.click(screen.getByRole("button", { name: "Enviar fotos" }));

    await waitFor(() => {
      expect(screen.getAllByTestId("foto-item")).toHaveLength(3);
    });
    expect(screen.getByText(/enviada com sucesso/i)).toBeInTheDocument();
    expect(enviarFotos).toHaveBeenCalledTimes(1);
  });

  it("mostra o erro quando o envio falha e não adiciona foto nenhuma", async () => {
    const usuario = userEvent.setup();
    vi.mocked(enviarFotos).mockResolvedValue({
      sucesso: false,
      erro: "Formato não suportado",
    });

    render(<GerenciadorFotos imovelId="imovel-1" fotosIniciais={fotosIniciais} />);

    await usuario.upload(screen.getByTestId("input-upload"), arquivo());
    await usuario.click(screen.getByRole("button", { name: "Enviar fotos" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/Formato não suportado/);
    });
    expect(screen.getAllByTestId("foto-item")).toHaveLength(2);
  });

  it("exclui uma foto individual após confirmação", async () => {
    const usuario = userEvent.setup();
    vi.mocked(excluirFoto).mockResolvedValue({ sucesso: true });

    render(<GerenciadorFotos imovelId="imovel-1" fotosIniciais={fotosIniciais} />);

    const botoesExcluir = screen.getAllByRole("button", { name: "Excluir" });
    await usuario.click(botoesExcluir[0]);

    await waitFor(() => {
      expect(screen.getAllByTestId("foto-item")).toHaveLength(1);
    });
    expect(excluirFoto).toHaveBeenCalledWith("f1", "imovel-1/a.jpg");
  });

  it("exclui todas as fotos de uma vez após confirmação", async () => {
    const usuario = userEvent.setup();
    vi.mocked(excluirTodasFotos).mockResolvedValue({ sucesso: true });

    render(<GerenciadorFotos imovelId="imovel-1" fotosIniciais={fotosIniciais} />);

    await usuario.click(screen.getByRole("button", { name: /excluir todas as fotos/i }));

    await waitFor(() => {
      expect(screen.getByText("Nenhuma foto enviada ainda.")).toBeInTheDocument();
    });
    expect(excluirTodasFotos).toHaveBeenCalledWith("imovel-1");
  });

  it("não faz nada se o usuário cancelar a confirmação de excluir todas", async () => {
    const usuario = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<GerenciadorFotos imovelId="imovel-1" fotosIniciais={fotosIniciais} />);

    await usuario.click(screen.getByRole("button", { name: /excluir todas as fotos/i }));

    expect(excluirTodasFotos).not.toHaveBeenCalled();
    expect(screen.getAllByTestId("foto-item")).toHaveLength(2);
  });

  it("define uma foto diferente como capa e persiste a nova ordem", async () => {
    const usuario = userEvent.setup();
    vi.mocked(reordenarFotos).mockResolvedValue({ sucesso: true });

    render(<GerenciadorFotos imovelId="imovel-1" fotosIniciais={fotosIniciais} />);

    await usuario.click(screen.getByRole("button", { name: "Definir capa" }));

    await waitFor(() => {
      expect(reordenarFotos).toHaveBeenCalledWith("imovel-1", ["f2", "f1"]);
    });

    const itens = screen.getAllByTestId("foto-item");
    expect(within(itens[0]).getByText("Capa")).toBeInTheDocument();
    expect(itens[0]).toHaveAttribute("aria-label", expect.stringContaining("capa"));
  });

  it("reordena as fotos pelos botões de mover (equivalente ao drag-and-drop)", async () => {
    const usuario = userEvent.setup();
    vi.mocked(reordenarFotos).mockResolvedValue({ sucesso: true });

    render(<GerenciadorFotos imovelId="imovel-1" fotosIniciais={fotosIniciais} />);

    const moverParaFrente = screen.getAllByRole("button", {
      name: "Mover foto para a próxima posição",
    });
    await usuario.click(moverParaFrente[0]); // move f1 (posição 0) para a posição 1

    await waitFor(() => {
      expect(reordenarFotos).toHaveBeenCalledWith("imovel-1", ["f2", "f1"]);
    });
  });

  it("reverte a ordem local se o servidor recusar a nova ordem", async () => {
    const usuario = userEvent.setup();
    vi.mocked(reordenarFotos).mockResolvedValue({
      sucesso: false,
      erro: "Não foi possível salvar.",
    });

    render(<GerenciadorFotos imovelId="imovel-1" fotosIniciais={fotosIniciais} />);

    await usuario.click(screen.getByRole("button", { name: "Definir capa" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível salvar.");
    });

    // A ordem local voltou ao estado anterior: f1 continua sendo a capa.
    const itens = screen.getAllByTestId("foto-item");
    expect(within(itens[0]).getByText("Capa")).toBeInTheDocument();
  });

  it("substitui uma foto existente mantendo a posição", async () => {
    const usuario = userEvent.setup();
    vi.mocked(substituirFoto).mockResolvedValue({
      sucesso: true,
      fotos: [{ id: "f1", url: "imovel-1/nova-capa.jpg" }],
    });

    render(<GerenciadorFotos imovelId="imovel-1" fotosIniciais={fotosIniciais} />);

    const botoesSubstituir = screen.getAllByRole("button", { name: "Substituir" });
    await usuario.click(botoesSubstituir[0]);

    const inputSubstituir = screen.getByTestId("input-substituir");
    await usuario.upload(inputSubstituir, arquivo("nova-capa.jpg"));

    await waitFor(() => {
      expect(substituirFoto).toHaveBeenCalledWith(
        "f1",
        "imovel-1",
        "imovel-1/a.jpg",
        expect.any(FormData)
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/substituída com sucesso/i)).toBeInTheDocument();
    });

    const itens = screen.getAllByTestId("foto-item");
    // Continua na posição 0 (capa), só a imagem exibida mudou.
    expect(within(itens[0]).getByText("Capa")).toBeInTheDocument();
    expect(itens[0].querySelector("img")).toHaveAttribute(
      "src",
      "https://fake.test/imovel-1/nova-capa.jpg"
    );
  });
});
