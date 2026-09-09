import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, typography } from '@/constants/theme';

type Props = {
    label: string;
    active?: boolean;
    onPress: () => void;
};

export default function Chip({ label, active = false, onPress }: Props) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.chip,
                active && styles.active,
                { opacity: pressed ? 0.7 : 1 },
            ]}
        >
            <Text
                style={[
                    typography.small,
                    { color: active ? '#1A1408' : colors.textDim },
                    active && { color: '#1A1408', fontWeight: '700' },
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    chip: {
        borderRadius: radius.pill,
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
    },
    active: {
        backgroundColor: colors.gold,
        borderColor: colors.gold,
    },
});
