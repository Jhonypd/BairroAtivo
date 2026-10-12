import { tituloEstaPreenchido } from "../validacoes/tituloObrigatorio";

describe("título obrigatório da ocorrência", () => {
  it("rejeita um título vazio", () => {
    expect(tituloEstaPreenchido("")).toBe(false);
  });

  it("rejeita um título que contém apenas espaços", () => {
    expect(tituloEstaPreenchido("   \t  ")).toBe(false);
  });

  it("aceita um título preenchido", () => {
    expect(tituloEstaPreenchido("Buraco na rua")).toBe(true);
  });
});
