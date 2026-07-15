import FormularioFiltros from "@/components/public/FormularioFiltros";
import { OpcaoBairro, OpcaoLocalidade } from "@/lib/supabase/imoveis";

export default function Hero({
  categorias,
  cidades,
  bairros,
}: {
  categorias: string[];
  cidades: OpcaoLocalidade[];
  bairros: OpcaoBairro[];
}) {
  return (
    <section className="relative overflow-hidden bg-navy-900">
      {/* Textura sutil de fundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #C9A24B 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <p className="font-body text-sm font-medium uppercase tracking-[0.3em] text-gold-300">
          Corretor especializado em Itabuna e região
        </p>
        <h1 className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Compre, venda ou alugue o imóvel ideal em Itabuna e região com
          segurança e agilidade.
        </h1>

        <div className="mt-10">
          <FormularioFiltros
            categorias={categorias}
            cidades={cidades}
            bairros={bairros}
          />
        </div>
      </div>
    </section>
  );
}
