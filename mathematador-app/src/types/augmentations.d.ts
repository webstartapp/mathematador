import "react-native";

declare module "expo-jwt" {
  export function encode(
    payload: { userId: number | string; exp: number; iat: number },
    secret: string,
  ): string;
}

declare module "react-native" {
  interface NativeModulesStatic {
    HeaderModule?: import("react-native").NativeModule;
  }
}
