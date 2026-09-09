import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type Ticket = {
    id: number;
    subject: string;
    status: string;
    created_at: string;
};

export default function AdminSupportScreen() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        try {
            const { data } = await api.get('/admin/ops/support');
            setTickets(data?.tickets ?? []);
        } catch (e) {
            console.warn('Support load:', apiErrorMessage(e));
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    useEffect(() => {
        void load();
    }, []);

    const statusTone: Record<
        string,
        'success' | 'gold' | 'danger' | 'textFaint'
    > = {
        open: 'danger',
        closed: 'success',
    };

    return (
        <Screen>
            <Text
                style={[typography.hero, { color: colors.text, fontSize: 24 }]}
            >
                Support
            </Text>
            <FlatList
                data={tickets}
                keyExtractor={(t) => String(t.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Card>
                        <View style={styles.row}>
                            <View style={styles.info}>
                                <Text
                                    style={[
                                        typography.subtitle,
                                        { color: colors.text },
                                    ]}
                                >
                                    {item.subject}
                                </Text>
                                <Text
                                    style={[
                                        typography.small,
                                        { color: colors.textDim },
                                    ]}
                                >
                                    #{item.id} · {item.created_at}
                                </Text>
                            </View>
                            <View
                                style={[
                                    styles.badge,
                                    {
                                        backgroundColor:
                                            colors[
                                                statusTone[item.status] ??
                                                    'textFaint'
                                            ] + '22',
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.badgeText,
                                        {
                                            color: colors[
                                                statusTone[item.status] ??
                                                    'textFaint'
                                            ],
                                        },
                                    ]}
                                >
                                    {item.status.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    </Card>
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.gold}
                    />
                }
                ListEmptyComponent={
                    <Card>
                        <Text
                            style={[
                                typography.small,
                                { color: colors.textDim },
                            ]}
                        >
                            No support tickets.
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
    },
    info: { flex: 1 },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
});
