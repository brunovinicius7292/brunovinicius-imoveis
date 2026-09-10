// Compartilha um link pelo Web Share API nativo (celular) ou, quando
// indisponível (desktop), copia para a área de transferência — mesma lógica
// usada originalmente só em BotaoCompartilhar.tsx, extraída pra ser
// reaproveitada também pelo botão de compartilhar seleção.
export async function compartilharOuCopiarLink(
  titulo: string,
  url: string
): Promise<{ copiado: boolean }> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: titulo, url });
    } catch {
      // usuário cancelou o compartilhamento — nada a fazer
    }
    return { copiado: false };
  }

  await navigator.clipboard.writeText(url);
  return { copiado: true };
}
