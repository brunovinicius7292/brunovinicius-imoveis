"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CHAVE_ARMAZENAMENTO = "bruno-vinicius-imoveis:minha-selecao";

interface SelecaoContextValor {
  selecionados: string[];
  estaSelecionado: (id: string) => boolean;
  alternarSelecao: (id: string) => void;
  removerDaSelecao: (id: string) => void;
}

const SelecaoContext = createContext<SelecaoContextValor | null>(null);

function lerDoLocalStorage(): string[] {
  try {
    const bruto = window.localStorage.getItem(CHAVE_ARMAZENAMENTO);
    const valores = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(valores)
      ? valores.filter((valor): valor is string => typeof valor === "string")
      : [];
  } catch {
    return [];
  }
}

export function SelecaoProvider({ children }: { children: React.ReactNode }) {
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [carregado, setCarregado] = useState(false);

  // localStorage não existe no servidor — só lê depois de montar no cliente,
  // para o primeiro render do cliente bater com o HTML vindo do SSR.
  useEffect(() => {
    setSelecionados(lerDoLocalStorage());
    setCarregado(true);
  }, []);

  // Só persiste depois da leitura inicial, senão sobrescreveria o
  // localStorage com [] antes de carregar o que já estava salvo.
  useEffect(() => {
    if (!carregado) return;
    window.localStorage.setItem(
      CHAVE_ARMAZENAMENTO,
      JSON.stringify(selecionados)
    );
  }, [selecionados, carregado]);

  const estaSelecionado = useCallback(
    (id: string) => selecionados.includes(id),
    [selecionados]
  );

  const alternarSelecao = useCallback((id: string) => {
    setSelecionados((atual) =>
      atual.includes(id) ? atual.filter((valor) => valor !== id) : [...atual, id]
    );
  }, []);

  const removerDaSelecao = useCallback((id: string) => {
    setSelecionados((atual) => atual.filter((valor) => valor !== id));
  }, []);

  const valor = useMemo<SelecaoContextValor>(
    () => ({ selecionados, estaSelecionado, alternarSelecao, removerDaSelecao }),
    [selecionados, estaSelecionado, alternarSelecao, removerDaSelecao]
  );

  return (
    <SelecaoContext.Provider value={valor}>{children}</SelecaoContext.Provider>
  );
}

export function useSelecao(): SelecaoContextValor {
  const contexto = useContext(SelecaoContext);
  if (!contexto) {
    throw new Error("useSelecao deve ser usado dentro de SelecaoProvider");
  }
  return contexto;
}
