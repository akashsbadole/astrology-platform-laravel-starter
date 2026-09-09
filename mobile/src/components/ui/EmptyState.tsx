import { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '@/constants/theme';

type Props = {
    icon?: LucideIcon;
    title: string;
    message?: string;
};

/** Friendly empty state with optional lucide icon. */
export default function EmptyState({ icon: Icon, title, message }: Props) {
    return (
        <View style={styles.wrap}>
            {Icon ? (
                <Icon color={colors.textFaint} size={40} />
            ) : (
                <Text style={styles.zodiac}>🌙</Text>
            )}
            <Text style={[typography.subtitle, styles.title]}>{title}</Text>
            {message ? (
                <Text style={[typography.body, styles.message]}>{message}</Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        alignItems: 'center',
        gap: 8,
        paddingVertical: 48,
        paddingHorizontal: 24,
    },
    zodiac: { fontSize: 40 },
    title: { color: colors.text, textAlign: 'center' },
    message: { color: colors.textDim, textAlign: 'center' },
});
