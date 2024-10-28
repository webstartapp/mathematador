import { View } from 'react-native';

const RefManager = {
    headerRef: null as null | View,
};

export const setHeaderRef = (ref: View | null) => {
    RefManager.headerRef = ref;
};

export const getHeaderRef = () => RefManager.headerRef;

export default RefManager;
