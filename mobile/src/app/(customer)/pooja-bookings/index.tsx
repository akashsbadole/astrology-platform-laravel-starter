import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { inr } from '@/lib/format';

type PoojaBooking = {
    id: number;
    pooja_name: string;
    scheduled_date: string;
    amount: number;
    status: string;
    payment_status: string;
};

export default function PoojaBookingsScreen() {
    const router = useRouter();
    const [bookings, setBookings] = useState<PoojaBooking[]>([]);

    useEffect(() => {
        void loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const { data } = await api.get('/pooja-bookings');
            setBookings(data?.data ?? []);
        } catch (e) {
            console.warn('Pooja bookings load:', apiErrorMessage(e));
        }
    };

    return (
        <Screen>
            <Text
                style={[typography.hero, { color: colors.text, fontSize: 24 }]}
            >
                Pooja Bookings
            </Text>
            <FlatList
                data={bookings}
                keyExtractor={(b) => String(b.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Card
                        onPress={() =>
                            router.push(`/pooja-bookings/${item.id}/checkout`)
                        }
                    >
                        <Text
                            style={[
                                typography.subtitle,
                                { color: colors.text },
                            ]}
                        >
                            {item.pooja_name}
                        </Text>
                        <Text
                            style={[
                                typography.small,
                                { color: colors.textDim },
                            ]}
                        >
                            {item.scheduled_date}
                        </Text>
                        <View style={styles.row}>
                            <Text
                                style={[
                                    typography.subtitle,
                                    { color: colors.gold },
                                ]}
                            >
                                {inr(item.amount / 100)}
                            </Text>
                            <View
                                style={[
                                    styles.badge,
                                    { backgroundColor: colors.success + '22' },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.badgeText,
                                        { color: colors.success },
                                    ]}
                                >
                                    {item.status.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    </Card>
                )}
                ListEmptyComponent={
                    <Card>
                        <Text
                            style={[
                                typography.small,
                                { color: colors.textDim },
                            ]}
                        >
                            No pooja bookings yet.
                        </Text>
                    </Card>
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
});
