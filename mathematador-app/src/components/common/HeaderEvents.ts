import { NativeEventEmitter, NativeModules } from "react-native";

const { HeaderModule } = NativeModules;
const eventEmitter = new NativeEventEmitter(HeaderModule);

export const HeaderEvents = {
  onHeaderHeightChange: (callback: (height: number) => void): (() => void) => {
    const subscription = eventEmitter.addListener(
      "headerHeightChange",
      callback,
    );
    return (): void => {
      subscription.remove();
    };
  },
  emitHeaderHeightChange: (height: number): void => {
    eventEmitter.emit("headerHeightChange", height);
  },
};
