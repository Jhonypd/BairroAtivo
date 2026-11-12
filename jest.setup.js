jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

jest.mock("@/shared/icons/ellipsis-vertical.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/thumb_up_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
