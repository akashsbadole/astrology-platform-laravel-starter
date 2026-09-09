import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { gradient } from '@/constants/theme';

type Props = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    padded?: boolean;
};

/** Full-screen night-sky gradient background. */
export default function Screen({ children, style, padded = true }: Props) {
    return (
        <LinearGradient
            colors={gradient.bg}
            style={styles.flex}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
        >
            <View style={[styles.flex, padded && styles.pad, style]}>
                {children}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    pad: { padding: 16, backgroundColor: 'transparent' },
});
