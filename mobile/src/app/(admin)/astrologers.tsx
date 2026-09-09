import { Check, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, radius, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type AdminAstrologer = {
    id: number;
    name: string;
    email: string;
    status: string;
    experience_years: number;
    specializations: string[];
    created_at: string;
};

type StatusFilter = 'pending' | 'approved' | 'rejected';

export default function AdminAstrologersScreen() {
    const [astrologers, setAstrologers] = useState<AdminAstrologer[]>([]);
    const [filter, setFilter] = useState<StatusFilter>('pending');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        void loadAstrologers();
    }, [filter]);

    const loadAstrologers = async () => {
        try {
            const { data } = await api.get('/admin/astrologers', {
                params: { status: filter },
            });
            setAstrologers(data?.astrologers ?? []);
        } catch (e) {
            console.warn('Astrologers load:', apiErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAstrologers();
        setRefreshing(false);
    };

    const approve = async (id: number) => {
        try {
            await api.patch(`/admin/astrologers/${id}/approve`);
            setAstrologers((prev) =>
                prev.map((a) =>
                    a.id === id ? { ...a, status: 'approved' } : a,
                ),
            );
        } catch (e) {
            Alert.alert('Error', apiErrorMessage(e));
        }
    };

    const reject = async (id: number) => {
        Alert.alert('Reject application', 'Provide a rejection reason?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Reject',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.patch(`/admin/astrologers/${id}/reject`, {
                            rejection_reason:
                                'Application does not meet requirements.',
                        });
                        setAstrologers((prev) =>
                            prev.map((a) =>
                                a.id === id ? { ...a, status: 'rejected' } : a,
                            ),
                        );
                    } catch (e) {
                        Alert.alert('Error', apiErrorMessage(e));
                    }
                },
            },
        ]);
    };

    const statusTone: Record<string, 'gold' | 'success' | 'danger'> = {
        approved: 'success',
        pending: 'gold',
        rejected: 'danger',
    };

    const renderItem = ({ item }: { item: AdminAstrologer }) => {
        const tone = statusTone[item.status] ?? 'gold';
        return (
            <Card>
                <View style={styles.row}>
                    <View style={styles.info}>
                        <Text
                            style={[
                                typography.subtitle,
                                { color: colors.text },
                            ]}
                        >
                            {item.name}
                        </Text>
                        <Text
                            style={[
                                typography.small,
                                { color: colors.textDim },
                            ]}
                        >
                            {item.email}
                        </Text>
                        <Text
                            style={[
                                typography.small,
                                { color: colors.textFaint },
                            ]}
                        >
                            {item.experience_years} yrs ·{' '}
                            {item.specializations.slice(0, 2).join(', ')}
                        </Text>
                        <View
                            style={[
                                styles.badge,
                                { backgroundColor: colors[tone] + '22' },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.badgeText,
                                    { color: colors[tone] },
                                ]}
                            >
                                {item.status.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    {item.status === 'pending' && (
                        <View style={styles.actions}>
                            <View
                                style={[
                                    styles.iconBtn,
                                    { backgroundColor: colors.success + '22' },
                                ]}
                            >
                                <Check
                                    color={colors.success}
                                    size={18}
                                    onPress={() => approve(item.id)}
                                />
                            </View>
                            <View
                                style={[
                                    styles.iconBtn,
                                    { backgroundColor: colors.danger + '22' },
                                ]}
                            >
                                <X
                                    color={colors.danger}
                                    size={18}
                                    onPress={() => reject(item.id)}
                                />
                            </View>
                        </View>
                    )}
                </View>
            </Card>
        );
    };

    const filters: { label: string; value: StatusFilter }[] = [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
    ];

    return (
        <Screen>
            <Text
                style={[typography.hero, { color: colors.text, fontSize: 24 }]}
            >
                Astrologers
            </Text>
            <View style={styles.filterRow}>
                {filters.map((f) => (
                    <Card
                        key={f.value}
                        style={[
                            styles.filterChip,
                            filter === f.value && {
                                backgroundColor: colors.gold + '22',
                                borderColor: colors.gold,
                            },
                        ]}
                        onPress={() => setFilter(f.value)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                {
                                    color:
                                        filter === f.value
                                            ? colors.gold
                                            : colors.textDim,
                                },
                            ]}
                        >
                            {f.label}
                        </Text>
                    </Card>
                ))}
            </View>
            <FlatList
                data={astrologers}
                keyExtractor={(a) => String(a.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={renderItem}
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
                            {loading ? 'Loading…' : 'No astrologers found.'}
                        </Text>
                    </Card>
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    filterChip: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    filterText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
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
        borderRadius: radius.pill,
    },
    badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    actions: { flexDirection: 'row', gap: 8 },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
