import FiltrosSticky from "@/components/public/FiltrosSticky";
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

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <h1 className="max-w-2xl font-display text-4xl font-semibold leading-[1.15] text-white sm:text-5xl">
          Compra, venda e aluguel de imóveis em Itabuna e região.
        </h1>
        <p className="mt-4 font-body text-sm font-medium uppercase tracking-[0.3em] text-gold-300">
          CRECI-BA 30.048
        </p>

        <div className="mt-10 sm:mt-12">
          <FiltrosSticky
            categorias={categorias}
            cidades={cidades}
            bairros={bairros}
          />
        </div>
      </div>
    </section>
  );
}
