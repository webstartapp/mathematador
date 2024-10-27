import { FC, PropsWithChildren, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import ThemedText from "../texts/ThemedText";

const CenteredDesk: FC<{
    title: string;
    subtitles?: string[];
    descriptions?: string[];
    children?: ReactNode;
}> = ({
    title,
    subtitles,
    descriptions,
    children,
}) => (
    <View style={styles.container}>
        <ThemedText variant='title' style={styles.title}>{title}</ThemedText>
        {subtitles?.map((subtitle, index) => (
            <ThemedText key={`subtitles_key${index}`} variant='subtitle' style={styles.subtitle} >{subtitle}</ThemedText>
        ))}
        {descriptions?.map((description, index) => (
            <ThemedText key={`descriptions_key${index}`} variant='description' style={styles.description} >{description}</ThemedText>
        ))}
        {children}
    </View>
);

const styles = StyleSheet.create({
    container: {
        borderRadius: 10,
        borderColor: '#E4Ab67',
        borderWidth: 5,
        backgroundColor: '#d49b57',
        color: '#fff',
        padding: 20,
        shadowColor: '#B47b37',
        shadowOffset: {
            width: 2,
            height: 2,
        }
    },
    title: {
        fontSize: 30,
        marginBottom: 10,
        color: 'white',
        textShadowColor: 'black',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
    },
    subtitle: {
        fontSize: 24,
        marginBottom: 5,
        color: 'white',
        textShadowColor: 'black',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
        textAlign: 'center',
    },
    description: {
        fontSize: 18,
        marginBottom: 5,
        color: 'white',
        textShadowColor: 'black',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
        textAlign: 'justify',
    },
});



export default CenteredDesk;
