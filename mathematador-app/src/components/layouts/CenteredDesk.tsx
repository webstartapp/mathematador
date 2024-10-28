import { FC, PropsWithChildren, ReactNode } from "react";
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import ThemedText from "../texts/ThemedText";


const localStyles = StyleSheet.create({
    container: {
        borderRadius: 10,
        borderColor: '#E4Ab67',
        borderWidth: 5,
        backgroundColor: '#d49b57',
        color: '#fff',
        width: '100%',
        shadowColor: '#B47b37',
        shadowOffset: {
            width: 2,
            height: 2,
        },
    },
    wrapper: {
    },
    title: {
        fontSize: 30,
        marginBottom: 10,
        color: 'white',
        textShadowColor: 'black',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
        paddingLeft: 10,
        paddingRight: 10,
    },
    subtitle: {
        fontSize: 24,
        marginBottom: 5,
        color: 'white',
        textShadowColor: 'black',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
        textAlign: 'center',
        paddingLeft: 10,
        paddingRight: 10,
    },
    description: {
        fontSize: 18,
        marginBottom: 5,
        color: 'white',
        textShadowColor: 'black',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
        textAlign: 'justify',
        paddingLeft: 10,
        paddingRight: 10,
    },
});

type LocalStylesType = typeof localStyles;

const CenteredDesk: FC<{
    title: string;
    subtitles?: string[];
    descriptions?: string[];
    children?: ReactNode;
    styles?: Partial<Record<keyof LocalStylesType,  ViewStyle | TextStyle>>
}> = ({
    title,
    subtitles,
    descriptions,
    children,
    styles,
}) => {
    return (
        <View style={[localStyles.wrapper, styles?.wrapper]}>
            <View style={[localStyles.container, styles?.container]}>
                <ThemedText variant='title' style={[localStyles.title, styles?.title]}>{title}</ThemedText>
                {subtitles?.map((subtitle, index) => (
                    <ThemedText key={`subtitles_key${index}`} variant='subtitle' style={[localStyles.subtitle, styles?.subtitle]} >{subtitle}</ThemedText>
                ))}
                {descriptions?.map((description, index) => (
                    <ThemedText key={`descriptions_key${index}`} variant='description' style={[localStyles.description, styles?.description]} >{description}</ThemedText>
                ))}
                {children}
            </View>
        </View>
    );
}

export default CenteredDesk;
