import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type OpsStats = {
    gross: number;
    commission: number;
    orders: number;
    payouts_pending: number;
    refunds_open: number;
    disputes_open: number;
    tickets_open: number;
};

type OpsSection = {
    label: string;
    route: string;
    icon: string;
    color: string;
};

const SECTIONS: OpsSection[] = [
    {
        label: 'Coupons',
        route: '/(admin)/ops/coupons',
        icon: '🎟️',
        color: colors.violet,
    },
    {
        label: 'Payouts',
        route: '/(admin)/ops/payouts',
        icon: '💰',
        color: colors.success,
    },
    {
        label: 'Refunds',
        route: '/(admin)/ops/refunds',
        icon: '↩️',
        color: colors.gold,
    },
    {
        label: 'Disputes',
        route: '/(admin)/ops/disputes',
        icon: '⚡',
        color: colors.danger,
    },
    {
        label: 'Horoscopes',
        route: '/(admin)/ops/horoscopes',
        icon: '🔮',
        color: colors.violet,
    },
    {
        label: 'Products',
        route: '/(admin)/ops/products',
        icon: '📦',
        color: colors.success,
    },
    {
        label: 'Live',
        route: '/(admin)/ops/live',
        icon: '📡',
        color: colors.gold,
    },
    {
        label: 'Banners',
        route: '/(admin)/ops/banners',
        icon: '🖼️',
        color: colors.violet,
    },
    {
        label: 'Support',
        route: '/(admin)/ops/support',
        icon: '🎧',
        color: colors.gold,
    },
    {
        label: 'Shipments',
        route: '/(admin)/ops/shipments',
        icon: '🚚',
        color: colors.success,
    },
];

export default function AdminOpsScreen() {
    const router = useRouter();
    const [stats, setStats] = useState<OpsStats | null>(null);

    useEffect(() => {
        void loadOps();
    }, []);

    const loadOps = async () => {
        try {
            const { data } = await api.get('/admin/ops');
            setStats(data?.stats ?? null);
        } catch (e) {
            console.warn('Ops load:', apiErrorMessage(e));
        }
    };

    return (
        <Screen>
            <ScrollView
                contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                <Text
                    style={[
                        typography.hero,
                        { color: colors.text, fontSize: 24 },
                    ]}
                >
                    Ops Hub
                </Text>

                {stats && (
                    <View style={styles.statsRow}>
                        <Card style={styles.statCard}>
                            <Text style={styles.statLabel}>Gross</Text>
                            <Text
                                style={[
                                    styles.statValue,
                                    { color: colors.success },
                                ]}
                            >
                                ₹{(stats.gross / 100).toFixed(2)}
                            </Text>
                        </Card>
                        <Card style={styles.statCard}>
                            <Text style={styles.statLabel}>Commission</Text>
                            <Text
                                style={[
                                    styles.statValue,
                                    { color: colors.gold },
                                ]}
                            >
                                ₹{(stats.commission / 100).toFixed(2)}
                            </Text>
                        </Card>
                        <Card style={styles.statCard}>
                            <Text style={styles.statLabel}>Orders</Text>
                            <Text style={styles.statValue}>{stats.orders}</Text>
                        </Card>
                        <Card style={styles.statCard}>
                            <Text style={styles.statLabel}>Payouts</Text>
                            <Text
                                style={[
                                    styles.statValue,
                                    { color: colors.danger },
                                ]}
                            >
                                {stats.payouts_pending}
                            </Text>
                        </Card>
                    </View>
                )}

                <View style={styles.grid}>
                    {SECTIONS.map((section) => (
                        <Card
                            key={section.label}
                            style={styles.sectionCard}
                            onPress={() => router.push(section.route as any)}
                        >
                            <Text style={styles.sectionIcon}>
                                {section.icon}
                            </Text>
                            <Text
                                style={[
                                    styles.sectionLabel,
                                    { color: colors.text },
                                ]}
                            >
                                {section.label}
                            </Text>
                        </Card>
                    ))}
                </View>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: { width: '48%', paddingVertical: 14, gap: 4 },
    statLabel: {
        color: colors.textDim,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    statValue: { color: colors.text, fontSize: 18, fontWeight: '800' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    sectionCard: {
        width: '31%',
        alignItems: 'center',
        paddingVertical: 18,
        gap: 8,
        aspectRatio: 1,
        justifyContent: 'center',
    },
    sectionIcon: { fontSize: 28 },
    sectionLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
});
