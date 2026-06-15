import { Dimensions } from "react-native";

export interface ScreenSizes {
  readonly primarySize: {
    readonly width: number;
    readonly height: number;
  };
  readonly secondarySize: {
    readonly width: number;
    readonly height: number;
  };
  readonly orientation: "landscape" | "portrait";
  readonly size: number;
}

export const getScreenSizes = (
  primaryPercentage: number = 50,
  headerHeight: number = 0,
): ScreenSizes => {
  const { width, height } = Dimensions.get("window");
  const reducedHeight = height - headerHeight;
  const orientation = width > reducedHeight ? "landscape" : "portrait";
  let primarySize, secondarySize;

  if (orientation === "landscape") {
    primarySize = width * (primaryPercentage / 100);
    secondarySize = width - primarySize;
  } else {
    primarySize = reducedHeight * (primaryPercentage / 100);
    secondarySize = reducedHeight - primarySize;
  }
  return {
    primarySize: {
      width: orientation === "landscape" ? primarySize : width,
      height: orientation === "landscape" ? reducedHeight : primarySize,
    },
    secondarySize: {
      width: orientation === "landscape" ? secondarySize : width,
      height: orientation === "landscape" ? reducedHeight : secondarySize,
    },
    orientation,
    size: Math.min(width, reducedHeight),
  } as const;
};
