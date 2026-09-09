import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { inr } from '@/lib/format';

type OrderDetail = {
    id: number;
    status: string;
    shipping_status: string;
    tracking_number: string | null;
    carrier: string | null;
    total: number;
    items: Array<{ name: string; quantity: number; price_paise: number }>;
};

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [order, setOrder] = useState<OrderDetail | null>(null);

    useEffect(() => {
        if (id) void loadOrder();
    }, [id]);

    const loadOrder = async () => {
        try {
            const { data } = await api.get(`/shop/orders/${id}`);
            setOrder(data?.order ?? null);
        } catch (e) {
            console.warn('Order detail:', apiErrorMessage(e));
        }
    };

    if (!order) {
        return (
            <Screen>
                <Text style={[typography.small, { color: colors.textDim }]}>Loading…</Text>
            </Screen>
        );
    }

    return (
        <Screen>
            <ScrollView
                contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>
                    Order #{order.id}
                </Text>
                <Card>
                    <Text style={[typography.subtitle, { color: colors.text }]}>
                        Status
                    </Text>
                    <Text style={[typography.body, { color: colors.textDim }]}>
                        {order.status} · {order.shipping_status}
                    </Text>
                    {order.tracking_number && (
                        <Text style={[typography.small, { color: colors.textFaint, marginTop: 4 }]}>
                            {order.carrier} · {order.tracking_number}
                        </Text>
                    )}
                </Card>
                <Text style={[typography.title, { color: colors.text }]}>Items</Text>
                {order.items.map((item, i) => (
                    <Card key={i}>
                        <Text style={[typography.subtitle, { color: colors.text }]}>
                            {item.name}
                        </Text>
                        <Text style={[typography.small, { color: colors.textDim }]}>
                            Qty: {item.quantity}
                        </Text>
                        <Text style={[typography.subtitle, { color: colors.gold }]}>
                            {inr(item.price_paise * item.quantity / 100)}
                        </Text>
                    </Card>
                ))}
                <Card>
                    <View style={styles.totalRow}>
                        <Text style={[typography.subtitle, { color: colors.text }]}>Total</Text>
                        <Text style={[typography.subtitle, { color: colors.gold }]}>
                            {inr(order.total / 100)}
                        </Text>
                    </View>
                </Card>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    totalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
});
