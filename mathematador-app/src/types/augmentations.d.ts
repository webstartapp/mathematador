import "react-native";

declare module "expo-jwt" {
  export function encode(
    payload: { userId: number; exp: number; iat: number },
    secret: string,
  ): string;
}

declare module "react-native" {
  interface NativeModulesStatic {
    HeaderModule?: import("react-native").NativeModule;
  }
}
