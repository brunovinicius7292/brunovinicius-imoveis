// Route Segment Config para TODO o grupo (admin) — painel /admin/* e a
// tela /login. Ambos dependem de sessão verificada em runtime a partir dos
// cookies da requisição (ver middleware.ts, que já bloqueia visitante sem
// sessão em /admin/* e redireciona quem já está logado saindo de /login).
// O middleware roda a cada request de verdade, mas NUNCA roda durante
// `next build` — então nada aqui pode contar com ele pra decidir o que é
// seguro pré-renderizar. Algumas dessas páginas (dashboard, configurações,
// estatísticas, visitas) não chamam nenhuma API dinâmica (cookies/headers)
// no próprio caminho de render, e outras chamam só indiretamente (via
// createSupabaseServerClient(), dentro de uma função importada de outro
// arquivo) — nos dois casos, a detecção automática do Next de "isso precisa
// ser dinâmico" é uma inferência, não uma garantia, e é exatamente essa
// inferência que se comportou de um jeito no build local e de outro no
// build da Vercel (rotas que já usam cookies() indiretamente foram
// corretamente detectadas como dinâmicas aqui, mas a Vercel tentou
// pré-renderizá-las mesmo assim e a tentativa falhou).
//
// force-dynamic remove essa ambiguidade: declara explicitamente, num único
// ponto que cobre todo o grupo (admin), que nenhuma rota aqui deve ser
// pré-renderizada em build — sempre renderizada por requisição. Páginas
// filhas (app/(admin)/admin/layout.tsx e todas as páginas abaixo dele, além
// de app/(admin)/login/page.tsx) herdam esse valor automaticamente, sem
// precisar repetir em cada uma.
export const dynamic = "force-dynamic";

export default function GrupoAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
