import Link from "next/link";

export default function CartaoBoasVindas({
  titulo,
  descricao,
  href,
}: {
  titulo: string;
  descricao: string;
  href?: string;
}) {
  const conteudo = (
    <>
      <h3 className="font-display text-base font-semibold text-navy-900">
        {titulo}
      </h3>
      <p className="mt-1 font-body text-sm text-navy-500">{descricao}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-900/5 transition hover:shadow-md hover:ring-gold-300"
      >
        {conteudo}
      </Link>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-900/5">
      {conteudo}
    </div>
  );
}
