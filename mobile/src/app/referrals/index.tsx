import { Gift, Share2, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import {
    colors,
    gradient,
    radius,
    shadowCard,
    typography,
} from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { inr } from '@/lib/format';
type ReferralStats = {
    code: string;
    link: string;
    points: number;
    balance: number;
    total_referred: number;
    rewarded: number;
};
export default function ReferralsScreen() {
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadReferrals();
    }, []);
    const loadReferrals = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/referrals');
            setStats(data?.stats ?? null);
        } catch (e) {
            console.warn('Referrals load:', apiErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };
    const redeem = async () => {
        if (!stats || stats.points < 10) {
            Alert.alert(
                'Not enough points',
                'You need at least 10 points to redeem.',
            );
            return;
        }
        try {
            await api.post('/referrals/redeem', { points: stats.points });
            Alert.alert('Success', 'Points redeemed successfully!');
            loadReferrals();
        } catch (e) {
            Alert.alert('Redeem failed', apiErrorMessage(e));
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
                    Referrals
                </Text>
                <Card style={{ overflow: 'hidden', padding: 0 }}>
                    <View style={[styles.heroCard, shadowCard]}>
                        <Text style={styles.heroLabel}>YOUR REFERRAL CODE</Text>
                        <Text style={styles.heroCode}>
                            {stats?.code ?? '---'}
                        </Text>
                        <Text style={styles.heroHint}>
                            Share with friends — earn points for every
                            successful referral
                        </Text>
                    </View>
                </Card>
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>
                            {stats?.total_referred ?? 0}
                        </Text>
                        <Text style={styles.statLabel}>Referred</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>
                            {stats?.rewarded ?? 0}
                        </Text>
                        <Text style={styles.statLabel}>Rewarded</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>
                            {stats?.points ?? 0}
                        </Text>
                        <Text style={styles.statLabel}>Points</Text>
                    </View>
                </View>
                <Card>
                    <View style={styles.balanceRow}>
                        <View>
                            <Text
                                style={[
                                    typography.subtitle,
                                    { color: colors.text },
                                ]}
                            >
                                Loyalty Balance
                            </Text>
                            <Text
                                style={[
                                    typography.small,
                                    { color: colors.textDim },
                                ]}
                            >
                                Redeem points for wallet credit
                            </Text>
                        </View>
                        <Text style={styles.balanceAmount}>
                            {inr(stats?.balance ?? 0)}
                        </Text>
                    </View>
                    <Button
                        title="Redeem points"
                        onPress={redeem}
                        disabled={!stats || stats.points < 10}
                    />
                </Card>
            </ScrollView>
        </Screen>
    );
}
const styles = StyleSheet.create({
    heroCard: { backgroundColor: colors.gold, padding: 24, gap: 8 },
    heroLabel: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.2,
        color: 'rgba(26,20,8,0.7)',
    },
    heroCode: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1A1408',
        letterSpacing: 2,
    },
    heroHint: { fontSize: 12, fontWeight: '600', color: 'rgba(26,20,8,0.65)' },
    statsRow: { flexDirection: 'row', gap: 12 },
    statBox: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
    },
    statValue: { color: colors.text, fontSize: 22, fontWeight: '800' },
    statLabel: {
        color: colors.textFaint,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    balanceAmount: { color: colors.gold, fontSize: 24, fontWeight: '900' },
});
