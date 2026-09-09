import { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { useRazorpay } from '@/lib/razorpay';

export function RazorpayCheckout({
    visible,
    amount,
    orderId,
    keyId,
    onClose,
    onSuccess,
}: {
    visible: boolean;
    amount: number;
    orderId: string;
    keyId: string;
    onClose: () => void;
    onSuccess: (paymentId: string, signature: string) => void;
}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { checkout } = useRazorpay();

    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body style="margin:0;padding:0;background:#fff;">
    <script>
        var options = {
            key: "${keyId}",
            amount: ${amount},
            currency: "INR",
            name: "AstroTalk",
            description: "Wallet Recharge",
            order_id: "${orderId}",
            handler: function(response) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'success', razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature }));
            },
            modal: { ondismiss: function() { window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'cancelled' })); } }
        };
        var rzp = new Razorpay(options);
        rzp.open();
        rzp.on('payment.failed', function(response) { window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'failed', error: response.error.description })); });
    </script>
</body>
</html>`;

    const handleMessage = async (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.status === 'success') {
                await api.post('/wallet/verify', {
                    razorpay_payment_id: data.razorpay_payment_id,
                    razorpay_signature: data.razorpay_signature,
                    order_id: orderId,
                });
                onSuccess(data.razorpay_payment_id, data.razorpay_signature);
            } else if (data.status === 'cancelled') {
                onClose();
            } else {
                setError(data.error || 'Payment failed');
            }
        } catch (e) {
            setError(apiErrorMessage(e));
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Razorpay Checkout</Text>
                    <Text style={styles.subtitle}>
                        ₹{(amount / 100).toFixed(2)}
                    </Text>
                </View>
                {loading && !error && (
                    <View style={styles.loading}>
                        <ActivityIndicator size="large" color={colors.gold} />
                        <Text
                            style={[
                                typography.small,
                                { color: colors.textDim, marginTop: 12 },
                            ]}
                        >
                            Loading payment gateway…
                        </Text>
                    </View>
                )}
                {error && (
                    <View style={styles.errorWrap}>
                        <Text
                            style={[
                                typography.subtitle,
                                { color: colors.danger },
                            ]}
                        >
                            Payment Error
                        </Text>
                        <Text
                            style={[
                                typography.body,
                                { color: colors.textDim, marginTop: 8 },
                            ]}
                        >
                            {error}
                        </Text>
                        <Text
                            style={[
                                typography.small,
                                { color: colors.gold, marginTop: 12 },
                            ]}
                            onPress={onClose}
                        >
                            Dismiss
                        </Text>
                    </View>
                )}
                {!error && (
                    <WebView
                        source={{ html }}
                        onMessage={handleMessage}
                        onLoadEnd={() => setLoading(false)}
                        style={{ flex: 1 }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={true}
                    />
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: 48,
        backgroundColor: colors.bg2,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    title: { color: colors.text, fontSize: 18, fontWeight: '700' },
    subtitle: { color: colors.gold, fontSize: 16, fontWeight: '800' },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    errorWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
});
