import { Check, Clock, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    SegmentedControl,
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

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

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
            const params = filter === 'all' ? {} : { status: filter };
            const { data } = await api.get('/admin/astrologers', { params });
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
                prev.map((a) => (a.id === id ? { ...a, status: 'approved' } : a)),
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
                            rejection_reason: 'Application does not meet requirements.',
                        });
                        setAstrologers((prev) =>
                            prev.map((a) => (a.id === id ? { ...a, status: 'rejected' } : a)),
                        );
                    } catch (e) {
                        Alert.alert('Error', apiErrorMessage(e));
                    }
                },
            },
        ]);
    };

    const statusTone: Record<string, 'gold' | 'success' | 'danger' | 'neutral'> = {
        approved: 'success',
        pending: 'gold',
        rejected: 'danger',
    };

    const renderItem = ({ item }: { item: AdminAstrologer }) => (
        <Card>
            <View style={styles.row}>
                <View style={styles.info}>
                    <Text style={[typography.subtitle, { color: colors.text }]}>
                        {item.name}
                    </Text>
                    <Text style={[typography.small, { color: colors.textDim }]}>
                        {item.email}
                    </Text>
                    <Text style={[typography.small, { color: colors.textFaint }]}>
                        {item.experience_years} yrs · {item.specializations.slice(0, 2).join(', ')}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: colors[statusTone[item.status] ?? 'neutral'] + '22' }]}>
                        <Text style={[styles.badgeText, { color: colors[statusTone[item.status] ?? 'neutral'] }]}>
                            {item.status.toUpperCase()}
                        </Text>
                    </View>
                </View>
                {item.status === 'pending' && (
                    <View style={styles.actions}>
                        <View style={[styles.iconBtn, { backgroundColor: colors.success + '22' }]}>
                            <Check color={colors.success} size={18} onPress={() => approve(item.id)} />
                        </View>
                        <View style={[styles.iconBtn, { backgroundColor: colors.danger + '22' }]}>
                            <X color={colors.danger} size={18} onPress={() => reject(item.id)} />
                        </View>
                    </View>
                )}
            </View>
        </Card>
    );

    return (
        <Screen>
            <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>
                Astrologers
            </Text>
            <SegmentedControl
                values={['Pending', 'Approved', 'Rejected']}
                selectedIndex={filter === 'all' ? 0 : filter === 'pending' ? 0 : filter === 'approved' ? 1 : 2}
                onChange={(e) => {
                    const val = e.nativeEvent.value;
                    setFilter(val === 'Pending' ? 'pending' : val === 'Approved' ? 'approved' : 'rejected');
                }}
                style={{ marginBottom: 12 }}
                tintColor={colors.gold}
                textStyle={{ color: colors.text, fontSize: 12, fontWeight: '600' }}
            />
            <FlatList
                data={astrologers}
                keyExtractor={(a) => String(a.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={renderItem}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
                }
                ListEmptyComponent={
                    <Card>
                        <Text style={[typography.small, { color: colors.textDim }]}>
                            {loading ? 'Loading…' : 'No astrologers found.'}
                        </Text>
                    </Card>
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
