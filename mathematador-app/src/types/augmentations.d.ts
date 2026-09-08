import "react-native";

declare module "react-native" {
  interface NativeModulesStatic {
    HeaderModule?: import("react-native").NativeModule;
  }
}
