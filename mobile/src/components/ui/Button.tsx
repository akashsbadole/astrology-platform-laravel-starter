import { LinearGradient } from 'expo-linear-gradient';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
    type ViewStyle,
} from 'react-native';
import {
    colors,
    gradient,
    radius,
    shadowCard,
    typography,
} from '@/constants/theme';

type Variant = 'primary' | 'violet' | 'ghost' | 'danger' | 'outline';

type Props = {
    title: string;
    onPress: () => void;
    variant?: Variant;
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
};

const spinnerColor: Record<Variant, string> = {
    primary: colors.bg,
    violet: colors.white,
    danger: colors.white,
    ghost: colors.gold,
    outline: colors.gold,
};

export default function Button({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    icon,
    style,
}: Props) {
    const isGradient = variant !== 'ghost' && variant !== 'outline';
    const grad: [string, string, string] =
        variant === 'primary'
            ? gradient.gold
            : variant === 'violet'
              ? gradient.violet
              : ['#F87171', '#EF4444', '#DC2626'];

    const textColor =
        variant === 'primary'
            ? '#1A1408'
            : variant === 'ghost'
              ? colors.gold
              : variant === 'outline'
                ? colors.gold
                : colors.white;

    const content = (
        <View style={styles.inner}>
            {loading ? (
                <ActivityIndicator color={spinnerColor[variant]} />
            ) : (
                <>
                    {icon}
                    <Text style={[typography.subtitle, { color: textColor }]}>
                        {title}
                    </Text>
                </>
            )}
        </View>
    );

    if (isGradient) {
        return (
            <Pressable
                onPress={onPress}
                disabled={disabled || loading}
                style={({ pressed }) => [
                    { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
                    style,
                ]}
            >
                <LinearGradient
                    colors={grad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.base, shadowCard]}
                >
                    {content}
                </LinearGradient>
            </Pressable>
        );
    }

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={({ pressed }) => [
                styles.base,
                variant === 'outline' && styles.outline,
                { opacity: disabled ? 0.5 : pressed ? 0.7 : 1 },
                style,
            ]}
        >
            {content}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: radius.md,
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    outline: { backgroundColor: 'transparent', borderColor: colors.gold },
    inner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
