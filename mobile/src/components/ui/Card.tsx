import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Pressable, type PressableProps } from 'react-native';
import { colors, radius, shadowCard } from '@/constants/theme';

type Props = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
} & Pick<PressableProps, 'onPress' | 'disabled'>;

/** Glassmorphism card on the night-sky background. */
export default function Card({ children, style, onPress, disabled }: Props) {
    const Component = onPress ? Pressable : View;
    return (
        <Component
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [styles.card, shadowCard, style, onPress ? { opacity: pressed ? 0.7 : 1 } : null]}
        >
            {children}
        </Component>
    );
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
