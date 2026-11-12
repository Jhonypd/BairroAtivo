import { PaginaMinhasOcorrencias } from "@/features/ocorrencias/views/PaginaMinhasOcorrencias";
import { ProtecaoAutenticacao } from "@/features/autenticacao/components/ProtecaoAutenticacao";

export default function RotaMinhasOcorrencias() {
  return <ProtecaoAutenticacao><PaginaMinhasOcorrencias /></ProtecaoAutenticacao>;
}
