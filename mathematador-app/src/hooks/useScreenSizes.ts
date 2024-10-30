import { useEffect, useRef, useState } from "react";
import { getScreenSizes } from "../helpers/getScreenSizes";
import { Dimensions, findNodeHandle, NativeEventEmitter, NativeModules } from "react-native";
import { getHeaderRef } from "./RefManager";
import { HeaderEvents } from "../components/common/Header";

const { HeaderModule } = NativeModules;

const eventEmitter = new NativeEventEmitter(HeaderModule);

export const useScreenSizes = (primaryPercentage?: number) => {
const [screenSizes, setScreenSizes] = useState(() => getScreenSizes(primaryPercentage, 100));
useEffect(() => {
    const onChange = () => {
        const headerRef = getHeaderRef();
        if(headerRef) {
            headerRef?.measure((_x, _y, _width, height) => {
                setScreenSizes(getScreenSizes(primaryPercentage, height));
            });
            return () => {
                subscription?.remove();
                headerSubscription();
            };
        }
        setScreenSizes(getScreenSizes(primaryPercentage));
    };
    onChange();
    const subscription = Dimensions.addEventListener('change', onChange);
    const headerSubscription = HeaderEvents.onHeaderHeightChange(onChange);
        

    return () => {
        subscription?.remove();
        headerSubscription();
    };
}, [primaryPercentage]);

return screenSizes;
};
