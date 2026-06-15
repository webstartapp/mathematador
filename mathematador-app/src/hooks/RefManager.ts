import { View } from "react-native";

const RefManager: { headerRef: View | null } = {
  headerRef: null,
};

export const setHeaderRef = (headerRefInstance: View | null): void => {
  RefManager.headerRef = headerRefInstance;
};

export const getHeaderRef = (): View | null => RefManager.headerRef;

export default RefManager;
