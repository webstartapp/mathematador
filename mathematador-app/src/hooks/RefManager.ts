/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/consistent-type-assertions */
import { View } from "react-native";

const RefManager = {
  headerRef: null as null | View,
};

export const setHeaderRef = (headerRefInstance: View | null) => {
  RefManager.headerRef = headerRefInstance;
};

export const getHeaderRef = () => RefManager.headerRef;

export default RefManager;
