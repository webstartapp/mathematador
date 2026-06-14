/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-unsafe-argument, unused-imports/no-unused-vars */
import { useEffect, useState } from "react";
import { Dimensions, NativeEventEmitter, NativeModules } from "react-native";

import { HeaderEvents } from "@/components/common/Header";
import { getScreenSizes } from "@/helpers/getScreenSizes";
import { getHeaderRef } from "@/hooks/RefManager";

const { HeaderModule } = NativeModules;

const eventEmitter = new NativeEventEmitter(HeaderModule);

export const useScreenSizes = (primaryPercentage?: number) => {
  const [screenSizes, setScreenSizes] = useState(() =>
    getScreenSizes(primaryPercentage, 100),
  );
  useEffect(() => {
    const onChange = () => {
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
