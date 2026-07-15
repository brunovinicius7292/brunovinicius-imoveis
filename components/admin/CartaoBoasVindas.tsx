export default function CartaoBoasVindas({
  titulo,
  descricao,
}: {
  titulo: string;
  descricao: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-900/5">
      <h3 className="font-display text-base font-semibold text-navy-900">
        {titulo}
      </h3>
      <p className="mt-1 font-body text-sm text-navy-500">{descricao}</p>
    </div>
  );
}
