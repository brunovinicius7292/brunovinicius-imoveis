export default function PaginaEmConstrucao({ titulo }: { titulo: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
      <h1 className="font-display text-xl font-semibold text-navy-900">
        {titulo}
      </h1>
      <p className="mt-2 font-body text-sm text-navy-400">
        Esta área ainda está em construção. As funcionalidades de{" "}
        {titulo.toLowerCase()} serão implementadas em uma próxima etapa.
      </p>
    </div>
  );
}
