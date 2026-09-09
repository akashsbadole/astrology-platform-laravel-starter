import { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type Dispute = { id: number; status: string; resolution: string | null };

export default function AdminDisputesScreen() {
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        try {
            const { data } = await api.get('/admin/ops/disputes');
            setDisputes(data?.disputes ?? []);
        } catch (e) {
            console.warn('Disputes load:', apiErrorMessage(e));
        }
    };

    const resolve = async (id: number) => {
        Alert.prompt('Resolve dispute', 'Enter resolution', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Resolve',
                onPress: async (resolution: string | undefined) => {
                    if (!resolution) return;
                    try {
                        await api.post(`/admin/ops/disputes/${id}/resolve`, { resolution });
                        setDisputes((prev) => prev.filter((d) => d.id !== id));
                    } catch (e) {
                        Alert.alert('Error', apiErrorMessage(e));
                    }
                },
            },
        ]);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    useEffect(() => { void load(); }, []);

    return (
        <Screen>
            <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>Disputes</Text>
            <FlatList
                data={disputes}
                keyExtractor={(d) => String(d.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Card>
                        <Text style={[typography.subtitle, { color: colors.text }]}>
                            Dispute #{item.id}
                        </Text>
                        <Text style={[typography.small, { color: colors.textDim }]}>
                            {item.status}
                        </Text>
                        {item.resolution && (
                            <Text style={[typography.small, { color: colors.textFaint, marginTop: 4 }]}>
                                {item.resolution}
                            </Text>
                        )}
                        {item.status === 'open' && (
                            <Card style={styles.actionBtn} onPress={() => resolve(item.id)}>
                                <Text style={[typography.small, { color: colors.success }]}>Resolve</Text>
                            </Card>
                        )}
                    </Card>
                )}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
                ListEmptyComponent={
                    <Card>
                        <Text style={[typography.small, { color: colors.textDim }]}>No open disputes.</Text>
                    </Card>
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    actionBtn: {
        alignSelf: 'flex-start',
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
    },
});
