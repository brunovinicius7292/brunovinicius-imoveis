import { Imovel } from "@/lib/types/imovel";
import ImovelCard from "@/components/public/ImovelCard";

export default function FeaturedSection({ imoveis }: { imoveis: Imovel[] }) {
  if (imoveis.length === 0) return null;

  return (
    <section id="destaques" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-body text-sm font-medium uppercase tracking-[0.2em] text-gold-600">
            Seleção do corretor
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-navy-900">
            Imóveis em destaque
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {imoveis.map((imovel) => (
          <ImovelCard key={imovel.id} imovel={imovel} />
        ))}
      </div>
    </section>
  );
}
