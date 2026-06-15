import { useEffect, useState } from "react";
import { Dimensions } from "react-native";

import { HeaderEvents } from "@/components/common/HeaderEvents";
import { getScreenSizes, ScreenSizes } from "@/helpers/getScreenSizes";
import { getHeaderRef } from "@/hooks/RefManager";

export const useScreenSizes = (primaryPercentage?: number): ScreenSizes => {
  const [screenSizes, setScreenSizes] = useState(() =>
    getScreenSizes(primaryPercentage, 100),
  );
  useEffect(() => {
    const onChange = (): void => {
      const headerRef = getHeaderRef();
      if (headerRef) {
        headerRef?.measure((_unusedX, _unusedY, _width, height) => {
          setScreenSizes(getScreenSizes(primaryPercentage, height));
        });
      } else {
        setScreenSizes(getScreenSizes(primaryPercentage));
      }
    };
    onChange();
    const subscription = Dimensions.addEventListener("change", onChange);
    const headerSubscription = HeaderEvents.onHeaderHeightChange(onChange);

    return () => {
      subscription?.remove();
      headerSubscription();
    };
  }, [primaryPercentage]);

  return screenSizes;
};
