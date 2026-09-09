import { Play, Square } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type LiveSession = {
    id: number;
    title: string;
    status: string;
    astrologer_id: number;
};

export default function AdminLiveScreen() {
    const [sessions, setSessions] = useState<LiveSession[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        try {
            const { data } = await api.get('/admin/ops/live');
            setSessions(data?.sessions ?? []);
        } catch (e) {
            console.warn('Live load:', apiErrorMessage(e));
        }
    };

    const toggle = async (id: number) => {
        try {
            await api.post(`/admin/ops/live/${id}/toggle`);
            setSessions((prev) =>
                prev.map((s) =>
                    s.id === id
                        ? {
                              ...s,
                              status:
                                  s.status === 'live' ? 'scheduled' : 'live',
                          }
                        : s,
                ),
            );
        } catch (e) {
            console.warn('Toggle live:', apiErrorMessage(e));
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

    const statusTone: Record<string, 'success' | 'gold' | 'danger'> = {
        live: 'success',
        scheduled: 'gold',
        ended: 'danger',
    };

    return (
        <Screen>
            <Text
                style={[typography.hero, { color: colors.text, fontSize: 24 }]}
            >
                Live Sessions
            </Text>
            <FlatList
                data={sessions}
                keyExtractor={(s) => String(s.id)}
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
                                    {item.title}
                                </Text>
                                <Text
                                    style={[
                                        typography.small,
                                        { color: colors.textDim },
                                    ]}
                                >
                                    Astrologer #{item.astrologer_id}
                                </Text>
                                <View
                                    style={[
                                        styles.badge,
                                        {
                                            backgroundColor:
                                                colors[
                                                    statusTone[item.status] ??
                                                        'danger'
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
                                                        'danger'
                                                ],
                                            },
                                        ]}
                                    >
                                        {item.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                            <View
                                style={[
                                    styles.iconBtn,
                                    { backgroundColor: colors.success + '22' },
                                ]}
                            >
                                {item.status === 'live' ? (
                                    <Square
                                        color={colors.danger}
                                        size={18}
                                        onPress={() => toggle(item.id)}
                                    />
                                ) : (
                                    <Play
                                        color={colors.success}
                                        size={18}
                                        onPress={() => toggle(item.id)}
                                    />
                                )}
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
                            No live sessions.
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
        alignSelf: 'flex-start',
        marginTop: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
