import CartaoBoasVindas from "@/components/admin/CartaoBoasVindas";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">
        Olá, bem-vindo(a) de volta!
      </h1>
      <p className="mt-1 font-body text-navy-500">
        Este é o painel administrativo do seu catálogo de imóveis.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CartaoBoasVindas
          titulo="Imóveis"
          descricao="Cadastre, edite e gerencie os imóveis do seu catálogo."
          href="/admin/imoveis"
        />
        <CartaoBoasVindas
          titulo="Clientes"
          descricao="Em breve você poderá acompanhar seus clientes por aqui."
        />
        <CartaoBoasVindas
          titulo="Visitas"
          descricao="Em breve você poderá agendar e controlar visitas por aqui."
        />
        <CartaoBoasVindas
          titulo="Estatísticas"
          descricao="Em breve você verá dados e métricas do seu catálogo aqui."
        />
      </div>
    </div>
  );
}
