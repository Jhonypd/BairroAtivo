import { createContext, useContext, useMemo, useRef, useState } from "react";
import type { ComponentRef, PropsWithChildren } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import { BlurTargetView, BlurView } from "expo-blur";
import { cores } from "@/configs/tema";

type ContextoCarregamento = {
  executarComCarregamento: <T>(operacao: () => Promise<T>, mensagem?: string) => Promise<T>;
};

const Contexto = createContext<ContextoCarregamento | null>(null);

export function CarregamentoGlobalProvider({ children }: PropsWithChildren) {
  const operacoesAtivas = useRef(0);
  const alvoFundo = useRef<ComponentRef<typeof View> | null>(null);
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
      <BlurTargetView ref={alvoFundo} style={styles.alvoFundo}>
        {children}
      </BlurTargetView>
      <Modal transparent animationType="fade" statusBarTranslucent visible={visivel} onRequestClose={() => undefined}>
        <BlurView
          blurTarget={alvoFundo}
          blurMethod="dimezisBlurView"
          intensity={30}
          tint="light"
          style={StyleSheet.absoluteFill}
        >
          <View style={styles.overlay} accessibilityViewIsModal accessibilityRole="status" accessibilityLiveRegion="polite">
            <ActivityIndicator size="large" color={cores.primary} accessibilityLabel={mensagem} />
            <Text style={styles.mensagem}>{mensagem}</Text>
            <Text style={styles.auxiliar}>Aguarde um instante...</Text>
          </View>
        </BlurView>
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
  alvoFundo: { flex: 1 },
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10, backgroundColor: "rgba(247, 248, 244, 0.58)" },
  mensagem: { color: cores.primaryDark, fontSize: 16, fontWeight: "700" },
  auxiliar: { color: cores.textMuted, fontSize: 13 },
});
