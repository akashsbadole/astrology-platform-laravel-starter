import { Calendar, MessageCircle, Phone, Video } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, radius, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { inr } from '@/lib/format';

type AstrologerBooking = {
    id: number;
    customer_name: string;
    consultation_type: string;
    scheduled_at: string;
    duration_minutes: number;
    amount: string;
    status: string;
    payment_status: string;
    is_session_active: boolean;
    customer_notes: string | null;
};

const TYPE_ICON: Record<string, typeof MessageCircle> = {
    chat: MessageCircle,
    call: Phone,
    video: Video,
};

const STATUS_TONE: Record<string, 'success' | 'gold' | 'neutral' | 'danger'> = {
    confirmed: 'success',
    completed: 'gold',
    pending: 'neutral',
    cancelled: 'danger',
};

export default function AstrologerBookingsScreen() {
    const [bookings, setBookings] = useState<AstrologerBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        void loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const { data } = await api.get('/astrologer/bookings');
            setBookings(data?.data ?? []);
        } catch (e) {
            console.warn('Bookings load:', apiErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadBookings();
        setRefreshing(false);
    };

    const completeBooking = async (id: number) => {
        try {
            await api.patch(`/astrologer/bookings/${id}/complete`);
            setBookings((prev) =>
                prev.map((b) => (b.id === id ? { ...b, status: 'completed' } : b)),
            );
        } catch (e) {
            Alert.alert('Error', apiErrorMessage(e));
        }
    };

    const cancelBooking = async (id: number) => {
        Alert.alert('Cancel booking', 'Are you sure you want to cancel this booking?', [
            { text: 'No', style: 'cancel' },
            {
                text: 'Yes, cancel',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.patch(`/astrologer/bookings/${id}/cancel`);
                        setBookings((prev) =>
                            prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)),
                        );
                    } catch (e) {
                        Alert.alert('Error', apiErrorMessage(e));
                    }
                },
            },
        ]);
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderItem = ({ item }: { item: AstrologerBooking }) => {
        const Icon = TYPE_ICON[item.consultation_type] ?? MessageCircle;
        const canAct =
            item.status === 'confirmed' ||
            item.status === 'pending';
        return (
            <Card>
                <View style={styles.bookingRow}>
                    <View style={styles.iconWrap}>
                        <Icon color={colors.gold} size={20} />
                    </View>
                    <View style={styles.bookingInfo}>
                        <Text style={[typography.subtitle, { color: colors.text }]}>
                            {item.customer_name}
                        </Text>
                        <Text style={[typography.small, { color: colors.textDim }]}>
                            {formatDate(item.scheduled_at)} · {item.duration_minutes} min
                        </Text>
                        {item.customer_notes ? (
                            <Text
                                style={[
                                    typography.small,
                                    { color: colors.textFaint, marginTop: 2 },
                                ]}
                                numberOfLines={1}
                            >
                                Note: {item.customer_notes}
                            </Text>
                        ) : null}
                    </View>
                    <View style={styles.rightCol}>
                        <Text style={[typography.subtitle, { color: colors.gold }]}>
                            {inr(Number(item.amount) / 100)}
                        </Text>
                        <View style={styles.badgeRow}>
                            <View
                                style={[
                                    styles.badge,
                                    { backgroundColor: colors[STATUS_TONE[item.status] ?? 'neutral'] + '22' },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.badgeText,
                                        { color: colors[STATUS_TONE[item.status] ?? 'neutral'] },
                                    ]}
                                >
                                    {item.status.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
                {canAct && (
                    <View style={styles.actionsRow}>
                        {item.status === 'confirmed' && (
                            <Card
                                style={styles.actionBtn}
                                onPress={() => completeBooking(item.id)}
                            >
                                <Text style={styles.actionLabel}>Complete</Text>
                            </Card>
                        )}
                        {(item.status === 'confirmed' || item.status === 'pending') && (
                            <Card
                                style={[styles.actionBtn, styles.cancelBtn]}
                                onPress={() => cancelBooking(item.id)}
                            >
                                <Text style={[styles.actionLabel, { color: colors.danger }]}>
                                    Cancel
                                </Text>
                            </Card>
                        )}
                    </View>
                )}
            </Card>
        );
    };

    return (
        <Screen>
            <Text
                style={[typography.hero, { color: colors.text, fontSize: 24 }]}
            >
                Bookings
            </Text>
            <FlatList
                data={bookings}
                keyExtractor={(b) => String(b.id)}
                contentContainerStyle={{ gap: 12, paddingTop: 16, paddingBottom: 24 }}
                renderItem={renderItem}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
                }
                ListEmptyComponent={
                    <Card>
                        <Text style={[typography.small, { color: colors.textDim }]}>
                            {loading ? 'Loading bookings…' : 'No bookings yet.'}
                        </Text>
                    </Card>
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    bookingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookingInfo: { flex: 1 },
    rightCol: { alignItems: 'flex-end', gap: 6 },
    badgeRow: { flexDirection: 'row', gap: 6 },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: radius.pill,
    },
    badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
    actionBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
    },
    cancelBtn: { backgroundColor: colors.danger + '15' },
    actionLabel: { color: colors.text, fontSize: 13, fontWeight: '700' },
});
