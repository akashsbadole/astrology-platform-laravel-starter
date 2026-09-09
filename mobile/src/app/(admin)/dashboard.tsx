import { ArrowRight, Users, UserCheck, Wallet } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { useRouter } from 'expo-router';

type AdminStats = {
    total_users: number;
    total_customers: number;
    total_astrologers: number;
    pending_astrologers: number;
    approved_astrologers: number;
};

export default function AdminDashboardScreen() {
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats | null>(null);

    useEffect(() => {
        void loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const { data } = await api.get('/admin/dashboard');
            setStats(data?.stats ?? null);
        } catch (e) {
            console.warn('Admin dashboard:', apiErrorMessage(e));
        }
    };

    const statItems = stats
        ? [
              { icon: Users, label: 'Total Users', value: stats.total_users, color: colors.violet },
              { icon: UserCheck, label: 'Customers', value: stats.total_customers, color: colors.success },
              { icon: UserCheck, label: 'Astrologers', value: stats.total_astrologers, color: colors.gold },
              { icon: Users, label: 'Pending', value: stats.pending_astrologers, color: colors.danger },
          ]
        : [];

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
                    Admin Dashboard
                </Text>

                <View style={styles.statsGrid}>
                    {statItems.map(({ icon: Icon, label, value, color }) => (
                        <Card key={label} style={styles.statCard}>
                            <Icon color={color} size={24} />
                            <Text style={styles.statValue}>{value}</Text>
                            <Text style={styles.statLabel}>{label}</Text>
                        </Card>
                    ))}
                </View>

                <Card>
                    <Text style={[typography.subtitle, { color: colors.text, marginBottom: 12 }]}>
                        Quick Actions
                    </Text>
                    <View style={styles.actionRow}>
                        <Pressable style={styles.actionBtn} onPress={() => router.push('/(admin)/astrologers')}>
                            <Users color={colors.gold} size={20} />
                            <Text style={styles.actionText}>Astrologers</Text>
                            <ArrowRight color={colors.textFaint} size={16} />
                        </Pressable>
                        <Pressable style={styles.actionBtn} onPress={() => router.push('/(admin)/ops')}>
                            <Wallet color={colors.gold} size={20} />
                            <Text style={styles.actionText}>Ops Hub</Text>
                            <ArrowRight color={colors.textFaint} size={16} />
                        </Pressable>
                    </View>
                </Card>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: {
        width: '48%',
        alignItems: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    statValue: { color: colors.text, fontSize: 28, fontWeight: '800' },
    statLabel: { color: colors.textFaint, fontSize: 11, fontWeight: '700' },
    actionRow: { gap: 12 },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
    },
    actionText: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '700' },
});
