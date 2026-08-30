import { createSupabaseServerClient } from "@/lib/supabase/server";

type ClienteSupabase = ReturnType<typeof createSupabaseServerClient>;

// Converte o caminho salvo no banco (Storage) na URL pública do arquivo —
// usado tanto pelas buscas do site público (lib/supabase/imoveis.ts) quanto
// pelo painel admin (lib/supabase/imoveis-admin.ts), pra não duplicar essa
// conversão em dois lugares.
export function obterUrlPublicaFoto(supabase: ClienteSupabase, caminho: string) {
  return supabase.storage.from("imoveis").getPublicUrl(caminho).data.publicUrl;
}
