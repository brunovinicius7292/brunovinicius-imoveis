import { describe, expect, it } from "vitest";
import { moverItem, moverParaCapa, ordenarFotosPorOrdem } from "./fotos";

describe("moverItem", () => {
  it("move um item de uma posição para outra", () => {
    const resultado = moverItem(["a", "b", "c", "d"], 0, 2);
    expect(resultado).toEqual(["b", "c", "a", "d"]);
  });

  it("move um item para trás na lista", () => {
    const resultado = moverItem(["a", "b", "c", "d"], 3, 0);
    expect(resultado).toEqual(["d", "a", "b", "c"]);
  });

  it("não faz nada quando origem e destino são iguais", () => {
    const lista = ["a", "b", "c"];
    expect(moverItem(lista, 1, 1)).toBe(lista);
  });

  it("não faz nada com índices fora do intervalo", () => {
    const lista = ["a", "b", "c"];
    expect(moverItem(lista, -1, 1)).toBe(lista);
    expect(moverItem(lista, 0, 5)).toBe(lista);
  });

  it("não muda a lista original (imutável)", () => {
    const lista = ["a", "b", "c"];
    const resultado = moverItem(lista, 0, 2);
    expect(lista).toEqual(["a", "b", "c"]);
    expect(resultado).not.toBe(lista);
  });
});

describe("moverParaCapa", () => {
  it("move o item escolhido para o início da lista", () => {
    const resultado = moverParaCapa(["a", "b", "c"], 2);
    expect(resultado).toEqual(["c", "a", "b"]);
  });

  it("não faz nada se o item já é a capa (índice 0)", () => {
    const lista = ["a", "b", "c"];
    expect(moverParaCapa(lista, 0)).toBe(lista);
  });
});

describe("ordenarFotosPorOrdem", () => {
  it("ordena pela ordem persistida", () => {
    const fotos = [
      { id: "3", ordem: 2 },
      { id: "1", ordem: 0 },
      { id: "2", ordem: 1 },
    ];
    expect(ordenarFotosPorOrdem(fotos).map((f) => f.id)).toEqual(["1", "2", "3"]);
  });

  it("usa a posição de chegada como fallback para fotos antigas sem `ordem`", () => {
    const fotos = [
      { id: "primeira", ordem: null },
      { id: "segunda", ordem: undefined },
      { id: "terceira", ordem: null },
    ];
    // Sem nenhuma tendo `ordem`, o fallback deve preservar a ordem de
    // chegada (índice do array) em vez de virar NaN e bagunçar tudo.
    expect(ordenarFotosPorOrdem(fotos).map((f) => f.id)).toEqual([
      "primeira",
      "segunda",
      "terceira",
    ]);
  });

  it("mistura fotos com e sem `ordem` de forma previsível", () => {
    const fotos = [
      { id: "sem-ordem-no-indice-0", ordem: null }, // fallback = 0
      { id: "com-ordem-alta", ordem: 10 },
      { id: "com-ordem-baixa", ordem: 1 },
    ];
    expect(ordenarFotosPorOrdem(fotos).map((f) => f.id)).toEqual([
      "sem-ordem-no-indice-0",
      "com-ordem-baixa",
      "com-ordem-alta",
    ]);
  });
});
