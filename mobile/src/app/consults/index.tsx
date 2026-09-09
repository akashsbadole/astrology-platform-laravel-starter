import { MessageCircle, Phone, Video } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Badge from '@/components/ui/Badge';
import Screen from '@/components/ui/Screen';
import { colors, radius, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { timeAgo } from '@/lib/format';
import { useAuth } from '@/contexts/AuthContext';
import type { Consultation } from '@/types';

const STATUS_TONE: Record<string, 'success' | 'gold' | 'danger' | 'neutral'> = {
    active: 'success',
    pending: 'gold',
    ended: 'neutral',
    cancelled: 'danger',
};

const TYPE_ICON = {
    chat: MessageCircle,
    call: Phone,
    video: Video,
} as const;

export default function ConsultsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [consults, setConsults] = useState<Consultation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConsults();
    }, []);

    const loadConsults = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/consultations');
            setConsults(data?.consultations?.data ?? []);
        } catch (e) {
            console.warn('Consults load:', apiErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    const otherName = (c: Consultation) =>
        user?.role === 'customer'
            ? (c.astrologer?.name ?? 'Astrologer')
            : (c.customer?.name ?? 'Customer');

    return (
        <Screen>
            <Text
                style={[typography.hero, { color: colors.text, fontSize: 24 }]}
            >
                My Consults
            </Text>
            <Text
                style={[
                    typography.small,
                    { color: colors.textDim, marginTop: 2 },
                ]}
            >
                {consults.length} session{consults.length !== 1 ? 's' : ''}
            </Text>

            <FlatList
                data={consults}
                keyExtractor={(c) => String(c.id)}
                contentContainerStyle={{
                    gap: 12,
                    paddingTop: 16,
                    paddingBottom: 24,
                }}
                showsVerticalScrollIndicator={false}
                refreshing={loading}
                onRefresh={loadConsults}
                renderItem={({ item }) => {
                    const Icon = TYPE_ICON[item.type];
                    return (
                        <Pressable
                            style={({ pressed }) => [
                                styles.card,
                                { opacity: pressed ? 0.9 : 1 },
                            ]}
                            onPress={() => router.push(`/consults/${item.id}`)}
                        >
                            <View style={styles.topRow}>
                                <View style={styles.iconWrap}>
                                    <Icon color={colors.gold} size={18} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={[
                                            typography.subtitle,
                                            { color: colors.text },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {item.type.toUpperCase()} ·{' '}
                                        {otherName(item)}
                                    </Text>
                                    <Text
                                        style={[
                                            typography.tiny,
                                            { color: colors.textFaint },
                                        ]}
                                    >
                                        {timeAgo(item.created_at)}
                                    </Text>
                                </View>
                                <Badge
                                    label={item.status}
                                    tone={STATUS_TONE[item.status] ?? 'default'}
                                />
                            </View>
                            <View style={styles.bottomRow}>
                                <Text style={styles.stat}>
                                    {item.billed_minutes} min
                                </Text>
                                <Text style={styles.stat}>₹{item.amount}</Text>
                                {item.end_reason ? (
                                    <Text
                                        style={[
                                            typography.tiny,
                                            { color: colors.textFaint },
                                        ]}
                                    >
                                        {item.end_reason}
                                    </Text>
                                ) : null}
                            </View>
                        </Pressable>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={{ fontSize: 40 }}>💬</Text>
                        <Text
                            style={[
                                typography.subtitle,
                                { color: colors.text, marginTop: 8 },
                            ]}
                        >
                            No consultations yet
                        </Text>
                        <Text
                            style={[
                                typography.small,
                                { color: colors.textDim, textAlign: 'center' },
                            ]}
                        >
                            Start a chat, call, or video session with an
                            astrologer to see it here.
                        </Text>
                    </View>
                }
            />
        </Screen>
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
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.goldSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    stat: {
        color: colors.textDim,
        fontSize: 12,
        fontWeight: '700',
    },
    empty: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 4,
    },
});
