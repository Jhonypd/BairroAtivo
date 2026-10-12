export function tituloEstaPreenchido(titulo: string): boolean {
  const tituloSemEspacosNasExtremidades = titulo.trim();

  return tituloSemEspacosNasExtremidades !== "";
}
