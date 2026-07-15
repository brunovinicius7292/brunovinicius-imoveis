import { Imovel } from "@/lib/types/imovel";
import ImovelCard from "@/components/public/ImovelCard";

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function agruparPorCategoria(imoveis: Imovel[]): [string, Imovel[]][] {
  const grupos = new Map<string, Imovel[]>();

  for (const imovel of imoveis) {
    const chave = imovel.tipo || "Outros";
    const lista = grupos.get(chave) ?? [];
    lista.push(imovel);
    grupos.set(chave, lista);
  }

  return Array.from(grupos.entries()).sort((a, b) =>
    a[0].localeCompare(b[0], "pt-BR")
  );
}

export default function SecaoImoveisAgrupados({
  legenda,
  titulo,
  imoveis,
}: {
  legenda: string;
  titulo: string;
  imoveis: Imovel[];
}) {
  if (imoveis.length === 0) return null;

  const categorias = agruparPorCategoria(imoveis);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-8">
        <p className="font-body text-sm font-medium uppercase tracking-[0.2em] text-gold-600">
          {legenda}
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-navy-900">
          {titulo}
        </h2>
      </div>

      <div className="flex flex-col gap-10">
        {categorias.map(([categoria, imoveisDaCategoria]) => (
          <div key={categoria}>
            <h3 className="mb-4 font-display text-xl font-semibold text-navy-800">
              {capitalizar(categoria)}
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {imoveisDaCategoria.map((imovel) => (
                <ImovelCard key={imovel.id} imovel={imovel} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
