import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { RazorpayCheckout } from '@/components/RazorpayCheckout';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { inr } from '@/lib/format';

type PoojaBooking = {
    id: number;
    pooja_name: string;
    scheduled_date: string;
    amount: number;
    status: string;
};

export default function PoojaBookingCheckoutScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [booking, setBooking] = useState<PoojaBooking | null>(null);
    const [loading, setLoading] = useState(false);
    const [checkoutVisible, setCheckoutVisible] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [razorpayKey, setRazorpayKey] = useState('');

    useEffect(() => {
        if (id) void loadBooking();
    }, [id]);

    const loadBooking = async () => {
        try {
            const { data } = await api.get(`/pooja-bookings/${id}/checkout`);
            setBooking(data?.booking ?? null);
            setRazorpayKey(data?.razorpayKeyId ?? '');
        } catch (e) {
            console.warn('Pooja checkout:', apiErrorMessage(e));
        }
    };

    const initiatePayment = async () => {
        if (!booking) return;
        setLoading(true);
        try {
            const { data } = await api.post(`/pooja-bookings/${id}/payment/order`);
            setOrderId(data.order_id);
            setCheckoutVisible(true);
        } catch (e) {
            Alert.alert('Payment error', apiErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async (paymentId: string, signature: string) => {
        setCheckoutVisible(false);
        setLoading(true);
        try {
            await api.post(`/pooja-bookings/${id}/payment/verify`, {
                razorpay_payment_id: paymentId,
                razorpay_signature: signature,
                razorpay_order_id: orderId,
            });
            Alert.alert('Success', 'Pooja booking confirmed!', [
                { text: 'OK', onPress: () => {} },
            ]);
        } catch (e) {
            Alert.alert('Verification failed', apiErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    if (!booking) {
        return (
            <Screen>
                <Text style={[typography.small, { color: colors.textDim }]}>Loading…</Text>
            </Screen>
        );
    }

    return (
        <Screen>
            <ScrollView
                contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>
                    Pooja Checkout
                </Text>
                <Card>
                    <Text style={[typography.subtitle, { color: colors.text }]}>
                        {booking.pooja_name}
                    </Text>
                    <Text style={[typography.small, { color: colors.textDim }]}>
                        {booking.scheduled_date}
                    </Text>
                    <View style={styles.totalRow}>
                        <Text style={[typography.subtitle, { color: colors.text }]}>Total</Text>
                        <Text style={[typography.subtitle, { color: colors.gold }]}>
                            {inr(booking.amount / 100)}
                        </Text>
                    </View>
                </Card>
                <Button
                    title="Pay Now"
                    loading={loading}
                    onPress={initiatePayment}
                />
            </ScrollView>
            <RazorpayCheckout
                visible={checkoutVisible}
                amount={Number(booking.amount)}
                orderId={orderId}
                keyId={razorpayKey}
                onClose={() => setCheckoutVisible(false)}
                onSuccess={handlePaymentSuccess}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    totalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
    },
});
