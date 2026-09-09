import { Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type Coupon = {
    id: number;
    code: string;
    type: string;
    value_paise: number;
    created_at: string;
};

export default function AdminCouponsScreen() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        try {
            const { data } = await api.get('/admin/ops/coupons');
            setCoupons(data?.coupons ?? []);
        } catch (e) {
            console.warn('Coupons load:', apiErrorMessage(e));
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    const addCoupon = async () => {
        Alert.prompt('New coupon', 'Enter coupon code', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Create',
                onPress: async (code: string | undefined) => {
                    if (!code) return;
                    try {
                        await api.post('/admin/ops/coupons', {
                            code,
                            type: 'flat',
                            value_paise: 500,
                        });
                        void load();
                    } catch (e) {
                        Alert.alert('Error', apiErrorMessage(e));
                    }
                },
            },
        ]);
    };

    useEffect(() => { void load(); }, []);

    return (
        <Screen>
            <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>Coupons</Text>
            <FlatList
                data={coupons}
                keyExtractor={(c) => String(c.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Card>
                        <View style={styles.row}>
                            <View>
                                <Text style={[typography.subtitle, { color: colors.text }]}>
                                    {item.code}
                                </Text>
                                <Text style={[typography.small, { color: colors.textDim }]}>
                                    {item.type} · ₹{(item.value_paise / 100).toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </Card>
                )}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
                ListEmptyComponent={
                    <Card>
                        <Text style={[typography.small, { color: colors.textDim }]}>No coupons yet.</Text>
                    </Card>
                }
            />
            <Button title="Add Coupon" icon={<Plus color="#1A1408" size={16} />} onPress={addCoupon} />
        </Screen>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
