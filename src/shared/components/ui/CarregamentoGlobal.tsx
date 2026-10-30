import { createContext, useContext, useMemo, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";
import { cores } from "@/configs/tema";

type ContextoCarregamento = {
  executarComCarregamento: <T>(operacao: () => Promise<T>, mensagem?: string) => Promise<T>;
};

const Contexto = createContext<ContextoCarregamento | null>(null);

export function CarregamentoGlobalProvider({ children }: PropsWithChildren) {
  const operacoesAtivas = useRef(0);
  const [visivel, definirVisivel] = useState(false);
  const [mensagem, definirMensagem] = useState("Carregando dados...");

  const contexto = useMemo<ContextoCarregamento>(() => ({
    executarComCarregamento: async <T,>(operacao: () => Promise<T>, texto = "Carregando dados...") => {
      operacoesAtivas.current += 1;
      definirMensagem(texto);
      definirVisivel(true);
      try {
        return await operacao();
      } finally {
        operacoesAtivas.current -= 1;
        if (operacoesAtivas.current === 0) definirVisivel(false);
      }
    },
  }), []);

  return (
    <Contexto.Provider value={contexto}>
      {children}
      <Modal transparent animationType="fade" statusBarTranslucent visible={visivel} onRequestClose={() => undefined}>
        <View style={styles.overlay} accessibilityViewIsModal>
          <ActivityIndicator size="large" color={cores.surface} accessibilityLabel={mensagem} />
        </View>
      </Modal>
    </Contexto.Provider>
  );
}

export function useCarregamentoGlobal() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useCarregamentoGlobal deve ser usado dentro de CarregamentoGlobalProvider");
  return contexto;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.38)" },
});
