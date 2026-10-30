import { FormularioOcorrencia } from "@/features/ocorrencias";
import { ProtecaoAutenticacao } from "@/features/autenticacao/components/ProtecaoAutenticacao";

export default function RotaNovaOcorrencia() {
  return <ProtecaoAutenticacao><FormularioOcorrencia /></ProtecaoAutenticacao>;
}
