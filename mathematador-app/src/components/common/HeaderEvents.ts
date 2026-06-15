import { NativeEventEmitter, NativeModules } from "react-native";

const { HeaderModule } = NativeModules;
const eventEmitter = HeaderModule ? new NativeEventEmitter(HeaderModule) : null;

export const HeaderEvents = {
  onHeaderHeightChange: (callback: (height: number) => void): (() => void) => {
    if (!eventEmitter) {
      return (): void => {};
    }
    const subscription = eventEmitter.addListener(
      "headerHeightChange",
      callback,
    );
    return (): void => {
      subscription.remove();
    };
  },
  emitHeaderHeightChange: (height: number): void => {
    if (eventEmitter) {
      eventEmitter.emit("headerHeightChange", height);
    }
  },
};
