jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

jest.mock("@/shared/icons/ellipsis-vertical.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/thumb_up_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));


jest.mock("react-native-maps", () => {
  const React = require("react");
  const { View } = require("react-native");
  const MapPart = React.forwardRef((props, ref) => React.createElement(View, { ...props, ref }));
  return { __esModule: true, default: MapPart, Marker: MapPart, Callout: MapPart };
});
