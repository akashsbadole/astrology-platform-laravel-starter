import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { inr } from '@/lib/format';

type Refund = { id: number; amount_paise: number; status: string; user_id: number };

export default function AdminRefundsScreen() {
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        try {
            const { data } = await api.get('/admin/ops/refunds');
            setRefunds(data?.refunds ?? []);
        } catch (e) {
            console.warn('Refunds load:', apiErrorMessage(e));
        }
    };

    const process = async (id: number) => {
        try {
            await api.post(`/admin/ops/refunds/${id}/process`);
            setRefunds((prev) => prev.filter((r) => r.id !== id));
        } catch (e) {
            console.warn('Process refund:', apiErrorMessage(e));
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
            <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>Refunds</Text>
            <FlatList
                data={refunds}
                keyExtractor={(r) => String(r.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Card>
                        <View style={styles.row}>
                            <View>
                                <Text style={[typography.subtitle, { color: colors.text }]}>
                                    Refund #{item.id}
                                </Text>
                                <Text style={[typography.small, { color: colors.textDim }]}>
                                    User #{item.user_id} · {item.status}
                                </Text>
                            </View>
                            <Text style={[typography.subtitle, { color: colors.gold }]}>
                                {inr(item.amount_paise / 100)}
                            </Text>
                        </View>
                        {item.status === 'requested' && (
                            <View style={styles.actions}>
                                <Card style={styles.actionBtn} onPress={() => process(item.id)}>
                                    <Text style={[typography.small, { color: colors.success }]}>Process</Text>
                                </Card>
                            </View>
                        )}
                    </Card>
                )}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
                ListEmptyComponent={
                    <Card>
                        <Text style={[typography.small, { color: colors.textDim }]}>No refunds pending.</Text>
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
