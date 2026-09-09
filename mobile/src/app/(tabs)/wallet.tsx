import { LinearGradient } from 'expo-linear-gradient';
import { ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { RazorpayCheckout } from '@/components/RazorpayCheckout';
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
    const [razorpayKey, setRazorpayKey] = useState<string>('');
    const [checkoutVisible, setCheckoutVisible] = useState(false);
    const [orderId, setOrderId] = useState<string>('');

    useEffect(() => {
        void loadWallet();
        void loadRazorpayKey();
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

    const loadRazorpayKey = async () => {
        try {
            const { data } = await api.get('/wallet/order');
            setRazorpayKey(data?.key_id || 'rzp_test_demo');
        } catch {
            setRazorpayKey('rzp_test_demo');
        }
    };

    const initiateRecharge = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/wallet/order', { amount });
            setOrderId(data.order_id);
            setCheckoutVisible(true);
        } catch (e) {
            Alert.alert('Recharge failed', apiErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async (paymentId: string, signature: string) => {
        setCheckoutVisible(false);
        setLoading(true);
        try {
            await api.post('/wallet/verify', { razorpay_payment_id: paymentId, razorpay_signature: signature, order_id: orderId });
            await loadWallet();
            Alert.alert('Success', `₹${inr(amount / 100)} added to your wallet!`);
        } catch (e) {
            Alert.alert('Verification failed', apiErrorMessage(e));
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
                    onPress={initiateRecharge}
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

            <RazorpayCheckout
                visible={checkoutVisible}
                amount={amount}
                orderId={orderId}
                keyId={razorpayKey}
                onClose={() => setCheckoutVisible(false)}
                onSuccess={handlePaymentSuccess}
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
