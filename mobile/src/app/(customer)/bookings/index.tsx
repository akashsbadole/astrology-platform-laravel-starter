import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { inr } from '@/lib/format';

type Booking = {
    id: number;
    astrologer_name: string;
    consultation_type: string;
    scheduled_at: string;
    duration_minutes: number;
    amount: number;
    status: string;
    payment_status: string;
    is_session_active: boolean;
};

export default function CustomerBookingsScreen() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);

    useEffect(() => {
        void loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const { data } = await api.get('/bookings');
            setBookings(data?.data ?? []);
        } catch (e) {
            console.warn('Bookings load:', apiErrorMessage(e));
        }
    };

    const statusTone: Record<string, 'gold' | 'success' | 'danger' | 'textFaint'> = {
        confirmed: 'success',
        completed: 'gold',
        pending: 'textFaint',
        cancelled: 'danger',
    };

    return (
        <Screen>
            <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>
                My Bookings
            </Text>
            <FlatList
                data={bookings}
                keyExtractor={(b) => String(b.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Card onPress={() => router.push(`/bookings/${item.id}/checkout`)}>
                        <Text style={[typography.subtitle, { color: colors.text }]}>
                            {item.astrologer_name}
                        </Text>
                        <Text style={[typography.small, { color: colors.textDim }]}>
                            {item.consultation_type.toUpperCase()} · {item.duration_minutes} min
                        </Text>
                        <Text style={[typography.small, { color: colors.textFaint }]}>
                            {new Date(item.scheduled_at).toLocaleString()}
                        </Text>
                        <View style={styles.row}>
                            <Text style={[typography.subtitle, { color: colors.gold }]}>
                                {inr(item.amount / 100)}
                            </Text>
                            <View style={[styles.badge, { backgroundColor: colors[statusTone[item.status] ?? 'textFaint'] + '22' }]}>
                                <Text style={[styles.badgeText, { color: colors[statusTone[item.status] ?? 'textFaint'] }]}>
                                    {item.status.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    </Card>
                )}
                ListEmptyComponent={
                    <Card>
                        <Text style={[typography.small, { color: colors.textDim }]}>
                            No bookings yet.
                        </Text>
                    </Card>
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
});
