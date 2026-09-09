import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { inr } from '@/lib/format';

type CartItem = { id: number; name: string; price_paise: number; quantity: number };

export default function CartScreen() {
    const router = useRouter();
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        void loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const { data } = await api.get('/shop/cart');
            setItems(data?.items ?? []);
        } catch (e) {
            console.warn('Cart load:', apiErrorMessage(e));
        }
    };

    const total = items.reduce((sum, i) => sum + i.price_paise * i.quantity, 0);

    return (
        <Screen>
            <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>
                Cart
            </Text>
            <FlatList
                data={items}
                keyExtractor={(i) => String(i.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Card>
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
                )}
                ListEmptyComponent={
                    <Card>
                        <Text style={[typography.small, { color: colors.textDim }]}>
                            Your cart is empty.
                        </Text>
                    </Card>
                }
            />
            {items.length > 0 && (
                <Card>
                    <View style={styles.totalRow}>
                        <Text style={[typography.subtitle, { color: colors.text }]}>Total</Text>
                        <Text style={[typography.subtitle, { color: colors.gold }]}>
                            {inr(total / 100)}
                        </Text>
                    </View>
                </Card>
            )}
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
