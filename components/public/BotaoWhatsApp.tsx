function apenasNumeros(valor: string) {
  return valor.replace(/\D/g, "");
}

export default function BotaoWhatsApp({ titulo }: { titulo: string }) {
  const numero = apenasNumeros(process.env.NEXT_PUBLIC_WHATSAPP_NUMERO ?? "");
  const mensagem = `Olá! Tenho interesse neste imóvel: ${titulo}. Poderia me passar mais informações?`;
  const href = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 font-body text-sm font-semibold text-white transition hover:brightness-95"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M17.47 14.38c-.29-.15-1.7-.84-1.96-.94-.26-.1-.46-.15-.65.15-.2.29-.75.94-.92 1.13-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.71-1.6-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.48.1-.2.05-.37-.02-.51-.07-.15-.65-1.58-.9-2.16-.24-.57-.48-.49-.65-.5h-.56c-.2 0-.51.07-.78.37-.26.29-1.02 1-1.02 2.43 0 1.44 1.05 2.83 1.2 3.02.15.2 2.06 3.15 5 4.42.7.3 1.24.48 1.67.62.7.22 1.34.19 1.84.11.56-.08 1.7-.7 1.94-1.37.24-.68.24-1.26.17-1.38-.07-.13-.26-.2-.55-.35Z" />
        <path d="M12.01 2C6.5 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.06-1.33A9.96 9.96 0 0 0 12.01 22C17.52 22 22 17.52 22 12S17.52 2 12.01 2Zm0 18.1c-1.7 0-3.28-.5-4.6-1.35l-.33-.2-3.02.79.8-2.94-.21-.34A8.09 8.09 0 0 1 3.9 12c0-4.47 3.64-8.1 8.11-8.1 4.47 0 8.1 3.63 8.1 8.1 0 4.47-3.63 8.1-8.1 8.1Z" />
      </svg>
      Falar no WhatsApp
    </a>
  );
}
