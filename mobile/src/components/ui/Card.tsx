import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadowCard } from '@/constants/theme';

type Props = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

/** Glassmorphism card on the night-sky background. */
export default function Card({ children, style }: Props) {
    return <View style={[styles.card, shadowCard, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: 16,
    },
});
