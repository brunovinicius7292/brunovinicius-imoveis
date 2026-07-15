// Considera uma linha "curta" (candidata a item de lista) quando tem poucas
// palavras — típico de descrições no formato "Piscina", "3 suítes", etc.
function ehLinhaCurta(linha: string) {
  return linha.trim().split(/\s+/).filter(Boolean).length <= 8;
}

export default function DescricaoImovel({ texto }: { texto: string }) {
  const linhas = texto
    .split("\n")
    .map((linha) => linha.trim())
    .filter((linha) => linha.length > 0);

  const pareceLista =
    linhas.length >= 3 &&
    linhas.filter(ehLinhaCurta).length / linhas.length >= 0.7;

  if (pareceLista) {
    return (
      <ul className="mt-2 flex flex-col gap-1.5 font-body leading-relaxed text-navy-600">
        {linhas.map((linha, indice) => (
          <li key={indice} className="flex gap-2">
            <span aria-hidden="true" className="text-gold-500">
              •
            </span>
            <span>{linha}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p className="mt-2 whitespace-pre-line font-body leading-relaxed text-navy-600">
      {texto}
    </p>
  );
}
