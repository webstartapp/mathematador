import { useScreenSizes } from '@/src/hooks/useScreenSizes';
import { FC, ReactNode, useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';

type HalvingLayoutProps = {
    UpperComponent: ReactNode;
    LowerComponent: ReactNode;
    upperPercentage?: number;
};

const HalvingLayout: FC<HalvingLayoutProps> = ({ UpperComponent, LowerComponent, upperPercentage = 50 }) => {
    const rectangularSize =  useScreenSizes(upperPercentage);

    return (
        <View style={[localStyles.container, {
            flexDirection: rectangularSize.orientation === 'landscape' ? 'row' : 'column',
        }]}>
            <View style={[localStyles.upper, rectangularSize.primarySize]}>
                {UpperComponent}
            </View>
            <View style={[localStyles.lower, rectangularSize.secondarySize]}>
                {LowerComponent}
            </View>
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
        width: '100%',
    },
    upper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    lower: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
});

export default HalvingLayout;
