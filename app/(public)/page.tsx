import Header from "@/components/public/Header";
import Hero from "@/components/public/Hero";
import FeaturedSection from "@/components/public/FeaturedSection";
import SecaoImoveisAgrupados from "@/components/public/SecaoImoveisAgrupados";
import SemResultados from "@/components/public/SemResultados";
import Footer from "@/components/public/Footer";
import {
  FiltrosImoveis,
  getBairrosDisponiveis,
  getCategoriasDisponiveis,
  getCidadesDisponiveis,
  getImoveisDestaque,
  getImoveisPublicados,
} from "@/lib/supabase/imoveis";

type ValorParam = string | string[] | undefined;

function paramTexto(valor: ValorParam): string | undefined {
  const texto = Array.isArray(valor) ? valor[0] : valor;
  return texto ? texto : undefined;
}

function paramNumero(valor: ValorParam): number | undefined {
  const texto = paramTexto(valor);
  if (!texto) return undefined;
  const numero = Number(texto);
  return Number.isFinite(numero) ? numero : undefined;
}

function montarFiltros(
  searchParams: Record<string, ValorParam>
): FiltrosImoveis {
  return {
    cidade: paramTexto(searchParams.cidade),
    bairro: paramTexto(searchParams.bairro),
    categoria: paramTexto(searchParams.categoria),
    precoMax: paramNumero(searchParams.precoMax),
    quartosMin: paramNumero(searchParams.quartos),
    vagasMin: paramNumero(searchParams.vagas),
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Record<string, ValorParam>;
}) {
  const filtros = montarFiltros(searchParams);

  const [imoveisDestaque, imoveisPublicados, categorias, cidades, bairros] =
    await Promise.all([
      getImoveisDestaque(filtros),
      getImoveisPublicados(filtros),
      getCategoriasDisponiveis(),
      getCidadesDisponiveis(),
      getBairrosDisponiveis(),
    ]);

  // "Imóveis em destaque" é apenas uma vitrine: os mesmos imóveis também
  // aparecem normalmente em Aluguel/Venda — sem exclusão entre as seções.
  const imoveisAluguel = imoveisPublicados.filter(
    (imovel) => imovel.finalidade === "aluguel"
  );
  const imoveisVenda = imoveisPublicados.filter(
    (imovel) => imovel.finalidade === "venda"
  );

  const totalEncontrados = imoveisPublicados.length;

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />
      <Hero categorias={categorias} cidades={cidades} bairros={bairros} />

      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <p className="font-body text-sm text-navy-500">
          {totalEncontrados}{" "}
          {totalEncontrados === 1
            ? "imóvel encontrado"
            : "imóveis encontrados"}
        </p>
      </div>

      {totalEncontrados === 0 ? (
        <SemResultados />
      ) : (
        <>
          <FeaturedSection imoveis={imoveisDestaque} />
          <SecaoImoveisAgrupados
            legenda="Para alugar"
            titulo="Imóveis para aluguel"
            imoveis={imoveisAluguel}
          />
          <SecaoImoveisAgrupados
            legenda="Para comprar"
            titulo="Imóveis para venda"
            imoveis={imoveisVenda}
          />
        </>
      )}

      <Footer />
    </main>
  );
}
