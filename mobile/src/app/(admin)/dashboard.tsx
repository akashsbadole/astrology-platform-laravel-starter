import { Users, UserCheck, Clock } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, radius, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type AdminStats = {
    total_users: number;
    total_customers: number;
    total_astrologers: number;
    pending_astrologers: number;
    approved_astrologers: number;
};

export default function AdminDashboardScreen() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/dashboard');
            setStats(data?.stats ?? null);
        } catch (e) {
            console.warn('Admin dashboard:', apiErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    const statItems = stats
        ? [
              { icon: Users, label: 'Total Users', value: stats.total_users },
              {
                  icon: UserCheck,
                  label: 'Customers',
                  value: stats.total_customers,
              },
              {
                  icon: UserCheck,
                  label: 'Astrologers',
                  value: stats.total_astrologers,
              },
              {
                  icon: Clock,
                  label: 'Pending',
                  value: stats.pending_astrologers,
              },
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
                    {statItems.map(({ icon: Icon, label, value }) => (
                        <Card key={label} style={styles.statCard}>
                            <Icon color={colors.gold} size={24} />
                            <Text style={styles.statValue}>{value}</Text>
                            <Text style={styles.statLabel}>{label}</Text>
                        </Card>
                    ))}
                </View>
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
});
