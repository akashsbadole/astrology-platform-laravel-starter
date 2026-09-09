import { LinearGradient } from 'expo-linear-gradient';
import { ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
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
import { inr, timeAgo } from '@/lib/format';
import type { WalletTransaction } from '@/lib/mock';

const AMOUNTS = [100, 500, 1000, 2000];

export default function WalletScreen() {
    const [amount, setAmount] = useState<number>(500);
    const [loading, setLoading] = useState(false);
    const [txns, setTxns] = useState<WalletTransaction[]>([]);
    const [balance, setBalance] = useState<number>(0);

    useEffect(() => {
        void loadWallet();
    }, []);

    const loadWallet = async () => {
        try {
            const { data } = await api.get('/wallet');
            setBalance(data?.balance ?? 0);
            setTxns(data?.transactions ?? []);
        } catch (e) {
            console.warn('Wallet load:', apiErrorMessage(e));
        }
    };

    const recharge = async () => {
        setLoading(true);
        try {
            // Backend tracker §3.2: POST /wallet/order → Razorpay order.
            const { data } = await api.post('/wallet/order', { amount });
            Alert.alert(
                'Razorpay order created',
                `Order ${data.order_id} for ${inr(data.amount / 100)}.\nCheckout opens once payments are configured (tracker §7.2).`,
            );
        } catch (e) {
            Alert.alert(
                'Recharge (demo)',
                `${apiErrorMessage(e)}\n\nWiring: /wallet/order → Razorpay Checkout → /wallet/verify. See tracker §7.2.`,
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Screen>
            <Text
                style={[typography.hero, { color: colors.text, fontSize: 24 }]}
            >
                Wallet
            </Text>

            <LinearGradient
                colors={gradient.gold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.hero, shadowCard]}
            >
                <Text style={styles.heroLabel}>AVAILABLE BALANCE</Text>
                <Text style={styles.heroAmount}>{inr(balance)}</Text>
                <Text style={styles.heroHint}>
                    Per-minute billing · refunds to wallet
                </Text>
            </LinearGradient>

            <Card>
                <Text style={[typography.subtitle, { color: colors.text }]}>
                    Recharge
                </Text>
                <View style={styles.amountRow}>
                    {AMOUNTS.map((a) => (
                        <View
                            key={a}
                            style={[
                                styles.amountChip,
                                amount === a && styles.amountActive,
                            ]}
                        >
                            <Text
                                onPress={() => setAmount(a)}
                                style={[
                                    typography.subtitle,
                                    {
                                        color:
                                            amount === a
                                                ? '#1A1408'
                                                : colors.textDim,
                                    },
                                ]}
                            >
                                ₹{a}
                            </Text>
                        </View>
                    ))}
                </View>
                <Button
                    title={`Add ${inr(amount)}`}
                    icon={<Plus color="#1A1408" size={16} />}
                    loading={loading}
                    onPress={recharge}
                />
            </Card>

            <Text
                style={[typography.title, { color: colors.text, marginTop: 8 }]}
            >
                Transactions
            </Text>
            <FlatList
                data={txns}
                keyExtractor={(t) => String(t.id)}
                contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
                renderItem={({ item }) => {
                    const label =
                        item.meta?.method === 'razorpay'
                            ? 'Wallet recharge'
                            : typeof item.meta?.consult === 'string'
                              ? item.meta.consult
                              : 'Consultation';
                    return (
                        <Card style={styles.txnCard}>
                            <View
                                style={[
                                    styles.txnIcon,
                                    item.type === 'credit'
                                        ? styles.creditBg
                                        : styles.debitBg,
                                ]}
                            >
                                {item.type === 'credit' ? (
                                    <ArrowDownLeft
                                        color={colors.success}
                                        size={16}
                                    />
                                ) : (
                                    <ArrowUpRight
                                        color={colors.danger}
                                        size={16}
                                    />
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={[
                                        typography.body,
                                        {
                                            color: colors.text,
                                            fontWeight: '600',
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {label}
                                </Text>
                                <Text
                                    style={[
                                        typography.tiny,
                                        { color: colors.textFaint },
                                    ]}
                                >
                                    {timeAgo(item.created_at)}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    typography.subtitle,
                                    {
                                        color:
                                            item.type === 'credit'
                                                ? colors.success
                                                : colors.danger,
                                    },
                                ]}
                            >
                                {item.type === 'credit' ? '+' : '−'}
                                {inr(item.amount)}
                            </Text>
                        </Card>
                    );
                }}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    hero: { borderRadius: radius.xl, padding: 20, gap: 4, marginTop: 12 },
    heroLabel: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.2,
        color: 'rgba(26,20,8,0.7)',
    },
    heroAmount: { fontSize: 36, fontWeight: '900', color: '#1A1408' },
    heroHint: { fontSize: 11, fontWeight: '600', color: 'rgba(26,20,8,0.65)' },
    amountRow: { flexDirection: 'row', gap: 10, marginVertical: 14 },
    amountChip: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
    },
    amountActive: { backgroundColor: colors.gold, borderColor: colors.gold },
    txnCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
    },
    txnIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    creditBg: { backgroundColor: colors.successSoft },
    debitBg: { backgroundColor: colors.dangerSoft },
});
