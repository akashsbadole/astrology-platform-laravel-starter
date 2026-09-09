import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { inr } from '@/lib/format';

type Order = {
    id: number;
    status: string;
    shipping_status: string;
    total: number;
};

export default function OrdersScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        void loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const { data } = await api.get('/shop-orders');
            setOrders(data?.orders ?? []);
        } catch (e) {
            console.warn('Orders load:', apiErrorMessage(e));
        }
    };

    return (
        <Screen>
            <Text
                style={[typography.hero, { color: colors.text, fontSize: 24 }]}
            >
                Orders
            </Text>
            <FlatList
                data={orders}
                keyExtractor={(o) => String(o.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Card onPress={() => router.push(`/orders/${item.id}`)}>
                        <Text
                            style={[
                                typography.subtitle,
                                { color: colors.text },
                            ]}
                        >
                            Order #{item.id}
                        </Text>
                        <Text
                            style={[
                                typography.small,
                                { color: colors.textDim },
                            ]}
                        >
                            {item.status} · {item.shipping_status}
                        </Text>
                        <Text
                            style={[
                                typography.subtitle,
                                { color: colors.gold },
                            ]}
                        >
                            {inr(item.total / 100)}
                        </Text>
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
                            No orders yet.
                        </Text>
                    </Card>
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({});
