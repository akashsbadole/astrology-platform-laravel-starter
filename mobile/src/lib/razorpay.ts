import { useCallback } from 'react';
import { Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import api from '@/lib/api';

type RazorpayOptions = {
    amount: number;
    orderId: string;
    keyId: string;
    name?: string;
    description?: string;
    onSuccess: (paymentId: string, signature: string) => void;
    onError: (error: string) => void;
};

export function useRazorpay() {
    const checkout = useCallback(
        (opts: RazorpayOptions) => {
            const { amount, orderId, keyId, name, description, onSuccess, onError } = opts;
            const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body>
    <script>
        var options = {
            key: "${keyId}",
            amount: ${amount},
            currency: "INR",
            name: "${name || 'AstroTalk'}",
            description: "${description || 'Wallet Recharge'}",
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
            Alert.alert('Razorpay', 'Checkout will open in WebView', [
                { text: 'Cancel', onPress: () => onError('cancelled') },
                {
                    text: 'Pay',
                    onPress: () => {
                        Alert.alert('Payment', 'In production, Razorpay checkout opens here. For demo, payment is simulated.', [
                            { text: 'OK', onPress: () => onSuccess('demo_pay_' + Date.now(), 'demo_sig_' + Date.now()) },
                        ]);
                    },
                },
            ]);
        },
        [],
    );

    return { checkout };
}
