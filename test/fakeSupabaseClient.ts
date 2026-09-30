// Fake mínimo do cliente Supabase (tabelas + storage) para testar as Server
// Actions de app/(admin)/admin/imoveis/actions.ts sem precisar de um banco
// real. Implementa só o subconjunto da API fluente (`from().select().eq()...`)
// que as actions realmente usam — não é um mock genérico do supabase-js.
import { vi } from "vitest";

type Linha = Record<string, any>;
type Resultado = { data: any; error: { message: string } | null };

class FakeQueryBuilder implements PromiseLike<Resultado> {
  private filtros: [string, any][] = [];
  private operacao: "select" | "insert" | "update" | "delete" = "select";
  private payload: any;
  private colunaOrdem?: string;
  private ordemAscendente = true;
  private limiteN?: number;
  private modoUnico: "single" | "maybeSingle" | null = null;

  // Diferencia ".select()" chamado como início de uma consulta (opera sobre
  // a operação "select") de ".insert(...).select(...)" / ".update(...).select(...)",
  // onde ".select()" só pede quais colunas voltar — a operação continua
  // sendo insert/update (mesma semântica do supabase-js real).
  private operacaoTravada = false;

  constructor(
    private tabela: Linha[],
    private gerarId: () => string
  ) {}

  select(_colunas?: string) {
    if (!this.operacaoTravada) {
      this.operacao = "select";
    }
    return this;
  }
  insert(payload: any) {
    this.operacao = "insert";
    this.operacaoTravada = true;
    this.payload = payload;
    return this;
  }
  update(payload: any) {
    this.operacao = "update";
    this.operacaoTravada = true;
    this.payload = payload;
    return this;
  }
  delete() {
    this.operacao = "delete";
    this.operacaoTravada = true;
    return this;
  }
  eq(coluna: string, valor: any) {
    this.filtros.push([coluna, valor]);
    return this;
  }
  order(coluna: string, opcoes?: { ascending?: boolean }) {
    this.colunaOrdem = coluna;
    this.ordemAscendente = opcoes?.ascending ?? true;
    return this;
  }
  limit(n: number) {
    this.limiteN = n;
    return this;
  }
  single() {
    this.modoUnico = "single";
    return this;
  }
  maybeSingle() {
    this.modoUnico = "maybeSingle";
    return this;
  }

  private aplicarFiltros(linhas: Linha[]) {
    return linhas.filter((linha) =>
      this.filtros.every(([coluna, valor]) => linha[coluna] === valor)
    );
  }

  private executar(): Resultado {
    if (this.operacao === "select") {
      let linhas = this.aplicarFiltros(this.tabela);

      if (this.colunaOrdem) {
        const coluna = this.colunaOrdem;
        linhas = [...linhas].sort((a, b) => {
          const diferenca = (a[coluna] ?? 0) - (b[coluna] ?? 0);
          return this.ordemAscendente ? diferenca : -diferenca;
        });
      }
      if (this.limiteN != null) {
        linhas = linhas.slice(0, this.limiteN);
      }

      if (this.modoUnico === "maybeSingle") {
        return { data: linhas[0] ? { ...linhas[0] } : null, error: null };
      }
      if (this.modoUnico === "single") {
        return linhas[0]
          ? { data: { ...linhas[0] }, error: null }
          : { data: null, error: { message: "Nenhum registro encontrado." } };
      }
      return { data: linhas.map((linha) => ({ ...linha })), error: null };
    }

    if (this.operacao === "insert") {
      const registros = Array.isArray(this.payload) ? this.payload : [this.payload];
      const inseridos = registros.map((registro) => {
        const novaLinha = { id: this.gerarId(), ...registro };
        this.tabela.push(novaLinha);
        return { ...novaLinha };
      });

      if (this.modoUnico) {
        return { data: inseridos[0], error: null };
      }
      return { data: inseridos, error: null };
    }

    if (this.operacao === "update") {
      const alvos = this.aplicarFiltros(this.tabela);
      alvos.forEach((linha) => Object.assign(linha, this.payload));

      if (this.modoUnico === "single") {
        return alvos[0]
          ? { data: { ...alvos[0] }, error: null }
          : {
              data: null,
              error: { message: "Nenhum registro encontrado para atualizar." },
            };
      }
      return { data: alvos.map((linha) => ({ ...linha })), error: null };
    }

    // delete
    const alvos = this.aplicarFiltros(this.tabela);
    alvos.forEach((linha) => {
      const indice = this.tabela.indexOf(linha);
      if (indice !== -1) this.tabela.splice(indice, 1);
    });
    return { data: alvos, error: null };
  }

  then<TResult1 = Resultado, TResult2 = never>(
    onfulfilled?: ((value: Resultado) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.executar()).then(onfulfilled, onrejected);
  }
}

export interface SupabaseFake {
  client: {
    from: (tabela: string) => FakeQueryBuilder;
    storage: { from: (bucket: string) => typeof storageFns };
  };
  db: Record<string, Linha[]>;
  storage: typeof storageFns;
}

type ResultadoStorage<T> = { data: T | null; error: { message: string } | null };

function criarFuncoesStorage() {
  return {
    upload: vi.fn<[string, any, any?], Promise<ResultadoStorage<{ path: string }>>>(
      async () => ({ data: { path: "" }, error: null })
    ),
    remove: vi.fn<[string[]], Promise<ResultadoStorage<null>>>(async () => ({
      data: null,
      error: null,
    })),
    copy: vi.fn<[string, string], Promise<ResultadoStorage<{ path: string }>>>(
      async () => ({ data: { path: "" }, error: null })
    ),
    getPublicUrl: vi.fn((caminho: string) => ({
      data: {
        publicUrl: `https://fake.supabase.co/storage/v1/object/public/imoveis/${caminho}`,
      },
    })),
  };
}

let storageFns: ReturnType<typeof criarFuncoesStorage>;

// Cria uma instância nova e isolada do banco fake — chamar em cada teste
// (ou beforeEach) para não vazar estado entre casos.
export function criarSupabaseFake(): SupabaseFake {
  const db: Record<string, Linha[]> = {
    imoveis: [],
    imovel_fotos: [],
  };

  let contador = 0;
  const gerarId = () => `id-${++contador}`;

  storageFns = criarFuncoesStorage();

  const client = {
    from(tabela: string) {
      if (!db[tabela]) db[tabela] = [];
      return new FakeQueryBuilder(db[tabela], gerarId);
    },
    storage: {
      from(_bucket: string) {
        return storageFns;
      },
    },
  };

  return { client, db, storage: storageFns };
}
