import { Platform, TextStyle } from "react-native";

// react-native-web warns on textShadowColor/Offset/Radius (deprecated in
// favor of a unified CSS-shorthand `textShadow` string), but React Native's
// own shipped types don't declare that unified prop on TextStyle yet, so it
// isn't safely typeable as a like-for-like swap - hence the platform split.
export type TextShadowStyle = TextStyle & { textShadow?: string };

export const createTextShadow = (
  color: string,
  offsetWidth: number,
  offsetHeight: number,
  radius: number,
): TextShadowStyle =>
  Platform.select<TextShadowStyle>({
    web: {
      textShadow: `${offsetWidth}px ${offsetHeight}px ${radius}px ${color}`,
    },
    default: {
      textShadowColor: color,
      textShadowOffset: { width: offsetWidth, height: offsetHeight },
      textShadowRadius: radius,
    },
  });
