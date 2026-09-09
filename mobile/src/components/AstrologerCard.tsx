import { MessageCircle } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { colors, radius, typography } from '@/constants/theme';
import { inr } from '@/lib/format';
import type { Astrologer } from '@/lib/mock';

type Props = {
    astrologer: Astrologer;
    onPress: () => void;
};

/** Horizontal/vertical astrologer card used by Home + Browse. */
export default function AstrologerCard({ astrologer, onPress }: Props) {
    const a = astrologer;
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                { opacity: pressed ? 0.9 : 1 },
            ]}
        >
            <View style={styles.topRow}>
                <Avatar name={a.name} size={52} online={a.is_online} />
                <View style={styles.info}>
                    <View style={styles.nameRow}>
                        <Text
                            style={[
                                typography.subtitle,
                                { color: colors.text },
                            ]}
                            numberOfLines={1}
                        >
                            {a.name}
                        </Text>
                        {a.is_first_free ? (
                            <Badge label="5 MIN FREE" tone="success" />
                        ) : null}
                    </View>
                    <Text
                        style={[typography.small, { color: colors.textDim }]}
                        numberOfLines={1}
                    >
                        {a.specializations.join(' · ')}
                    </Text>
                    <Text
                        style={[typography.tiny, { color: colors.textFaint }]}
                    >
                        {a.languages.join(', ')} · {a.experience_years} yrs
                    </Text>
                </View>
            </View>
            <View style={styles.bottomRow}>
                <View style={styles.rating}>
                    <Text style={styles.star}>★</Text>
                    <Text style={[typography.small, { color: colors.text }]}>
                        {a.rating_avg.toFixed(1)}
                    </Text>
                    <Text
                        style={[typography.tiny, { color: colors.textFaint }]}
                    >
                        ({a.rating_count})
                    </Text>
                    {a.is_online ? (
                        <Text style={styles.online}>● Online</Text>
                    ) : (
                        <Text style={styles.offline}>● Offline</Text>
                    )}
                </View>
                <View style={styles.cta}>
                    <MessageCircle color="#1A1408" size={14} />
                    <Text style={styles.ctaText}>
                        {a.rate_chat_per_min
                            ? `${inr(a.rate_chat_per_min)}/min`
                            : 'Free'}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: 14,
        gap: 12,
    },
    topRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    info: { flex: 1, gap: 3 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    star: { color: colors.gold, fontSize: 13 },
    online: {
        color: colors.online,
        fontSize: 10,
        marginLeft: 8,
        fontWeight: '700',
    },
    offline: {
        color: colors.textFaint,
        fontSize: 10,
        marginLeft: 8,
        fontWeight: '700',
    },
    cta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: colors.gold,
        borderRadius: radius.pill,
        paddingVertical: 7,
        paddingHorizontal: 12,
    },
    ctaText: { color: '#1A1408', fontWeight: '800', fontSize: 12 },
});
