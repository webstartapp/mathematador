import { FC, ReactNode } from "react";
import { View } from "react-native";

import { useScreenSizes } from "@/src/hooks/useScreenSizes";
import { halvingLayoutStyles as localStyles } from "@/theme";

type HalvingLayoutProps = {
  UpperComponent: ReactNode;
  LowerComponent: ReactNode;
  upperPercentage?: number;
};

const HalvingLayout: FC<HalvingLayoutProps> = ({
  UpperComponent,
  LowerComponent,
  upperPercentage = 50,
}) => {
  const rectangularSize = useScreenSizes(upperPercentage);

  return (
    <View
      style={[
        localStyles.container,
        {
          flexDirection:
            rectangularSize.orientation === "landscape" ? "row" : "column",
        },
      ]}
    >
      <View style={[localStyles.upper, rectangularSize.primarySize]}>
        {UpperComponent}
      </View>
      <View style={[localStyles.lower, rectangularSize.secondarySize]}>
        {LowerComponent}
      </View>
    </View>
  );
};

export default HalvingLayout;
