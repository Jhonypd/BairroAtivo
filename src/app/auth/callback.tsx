import { Stack, useLocalSearchParams } from "expo-router";
import { CallbackAutenticacao } from "@/features/autenticacao/views/CallbackAutenticacao";

function primeiro(valor: string | string[] | undefined) {
  return Array.isArray(valor) ? valor[0] : valor;
}

export default function RotaCallbackAutenticacao() {
  const { code, error_description: descricaoErro } = useLocalSearchParams<{
    code?: string | string[];
    error_description?: string | string[];
  }>();
  const codigo = primeiro(code);
  const descricao = primeiro(descricaoErro);

  return (
    <>
      <Stack.Screen options={{ title: "Autenticação", headerShown: false }} />
      <CallbackAutenticacao codigo={codigo} descricaoErro={descricao} />
    </>
  );
}
