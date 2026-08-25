// Helpers para o WhatsApp de clientes cadastrados no painel — diferente do
// número fixo do corretor (NEXT_PUBLIC_WHATSAPP_NUMERO, usado em
// BotaoWhatsApp.tsx no site público), aqui cada cliente tem o próprio
// número, digitado livremente no formulário de cadastro.

function apenasNumeros(valor: string) {
  return valor.replace(/\D/g, "");
}

// Formata para exibição na tabela: (73) 99999-8888. Se não bater com um
// número BR válido de 10/11 dígitos (com DDD), devolve como veio, para não
// esconder um número digitado num formato diferente.
export function formatarWhatsapp(valor: string): string {
  const digitos = apenasNumeros(valor);

  if (digitos.length === 11) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  }
  if (digitos.length === 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return valor;
}

// Monta o link wa.me a partir do número digitado, assumindo Brasil (55)
// quando o número vier apenas com DDD (10 ou 11 dígitos).
export function linkWhatsapp(valor: string, mensagem?: string): string {
  let digitos = apenasNumeros(valor);

  if (digitos.length === 10 || digitos.length === 11) {
    digitos = `55${digitos}`;
  }

  const query = mensagem ? `?text=${encodeURIComponent(mensagem)}` : "";
  return `https://wa.me/${digitos}${query}`;
}
