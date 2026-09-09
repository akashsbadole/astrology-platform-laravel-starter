import { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { inr } from '@/lib/format';

type ShipmentOrder = {
    id: number;
    customer: string;
    status: string;
    shipping_status: string;
    tracking_number: string | null;
    carrier: string | null;
    total: number;
};

const SHIPPING_STATUSES = ['pending', 'packed', 'shipped', 'in_transit', 'delivered', 'cancelled'] as const;

export default function AdminShipmentsScreen() {
    const [orders, setOrders] = useState<ShipmentOrder[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        try {
            const { data } = await api.get('/admin/ops/shipments');
            setOrders(data?.orders ?? []);
        } catch (e) {
            console.warn('Shipments load:', apiErrorMessage(e));
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.post(`/admin/ops/shipments/${id}`, { shipping_status: status });
            setOrders((prev) =>
                prev.map((o) => (o.id === id ? { ...o, shipping_status: status } : o)),
            );
        } catch (e) {
            Alert.alert('Error', apiErrorMessage(e));
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    useEffect(() => { void load(); }, []);

    return (
        <Screen>
            <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>Shipments</Text>
            <FlatList
                data={orders}
                keyExtractor={(o) => String(o.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Card>
                        <View style={styles.row}>
                            <View style={styles.info}>
                                <Text style={[typography.subtitle, { color: colors.text }]}>
                                    Order #{item.id}
                                </Text>
                                <Text style={[typography.small, { color: colors.textDim }]}>
                                    {item.customer}
                                </Text>
                                <Text style={[typography.small, { color: colors.textFaint }]}>
                                    {item.tracking_number ? `${item.carrier} · ${item.tracking_number}` : 'No tracking'}
                                </Text>
                            </View>
                            <Text style={[typography.subtitle, { color: colors.gold }]}>
                                {inr(item.total / 100)}
                            </Text>
                        </View>
                        <View style={styles.statusRow}>
                            {SHIPPING_STATUSES.map((status) => (
                                <Card
                                    key={status}
                                    style={[
                                        styles.statusChip,
                                        item.shipping_status === status && { backgroundColor: colors.gold + '22', borderColor: colors.gold },
                                    ]}
                                    onPress={() => updateStatus(item.id, status)}
                                >
                                    <Text
                                        style={[
                                            styles.statusText,
                                            { color: item.shipping_status === status ? colors.gold : colors.textDim },
                                        ]}
                                    >
                                        {status}
                                    </Text>
                                </Card>
                            ))}
                        </View>
                    </Card>
                )}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
                ListEmptyComponent={
                    <Card>
                        <Text style={[typography.small, { color: colors.textDim }]}>No shipments yet.</Text>
                    </Card>
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    info: { flex: 1 },
    statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    statusChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
});
