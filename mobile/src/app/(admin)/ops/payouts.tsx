import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { inr } from '@/lib/format';

type Payout = { id: number; amount_paise: number; status: string };
type Earning = { id: number; gross_paise: number; net_paise: number; status: string };

export default function AdminPayoutsScreen() {
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [earnings, setEarnings] = useState<Earning[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        try {
            const { data } = await api.get('/admin/ops/payouts');
            setPayouts(data?.payouts ?? []);
            setEarnings(data?.earnings ?? []);
        } catch (e) {
            console.warn('Payouts load:', apiErrorMessage(e));
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    const approve = async (id: number) => {
        try {
            await api.post(`/admin/ops/payouts/${id}/approve`);
            setPayouts((prev) => prev.filter((p) => p.id !== id));
        } catch (e) {
            console.warn('Approve payout:', apiErrorMessage(e));
        }
    };

    useEffect(() => { void load(); }, []);

    return (
        <Screen>
            <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>Payouts</Text>
            <FlatList
                data={payouts}
                keyExtractor={(p) => String(p.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Card>
                        <View style={styles.row}>
                            <View>
                                <Text style={[typography.subtitle, { color: colors.text }]}>
                                    Payout #{item.id}
                                </Text>
                                <Text style={[typography.small, { color: colors.textDim }]}>
                                    {item.status}
                                </Text>
                            </View>
                            <Text style={[typography.subtitle, { color: colors.gold }]}>
                                {inr(item.amount_paise / 100)}
                            </Text>
                        </View>
                        {item.status === 'requested' && (
                            <View style={styles.actions}>
                                <Card style={styles.actionBtn} onPress={() => approve(item.id)}>
                                    <Text style={[typography.small, { color: colors.success }]}>Approve</Text>
                                </Card>
                            </View>
                        )}
                    </Card>
                )}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
                ListEmptyComponent={
                    <Card>
                        <Text style={[typography.small, { color: colors.textDim }]}>No payouts pending.</Text>
                    </Card>
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    actions: { marginTop: 12 },
    actionBtn: {
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
    },
});
