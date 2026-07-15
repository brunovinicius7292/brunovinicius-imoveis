import ImovelForm from "@/components/admin/ImovelForm";

export default function NovoImovelPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">
        Novo imóvel
      </h1>
      <p className="mt-1 font-body text-navy-500">
        Preencha as informações abaixo para cadastrar um novo imóvel. Depois
        de salvar, você poderá enviar as fotos na tela de edição.
      </p>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
        <ImovelForm modo="criar" />
      </div>
    </div>
  );
}
