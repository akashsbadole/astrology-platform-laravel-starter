import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { inr } from '@/lib/format';

export default function CheckoutScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [pincode, setPincode] = useState('');

    const placeOrder = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/shop/checkout', { address, city, pincode });
            Alert.alert('Success', 'Order placed!', [
                { text: 'OK', onPress: () => router.push('/orders') },
            ]);
        } catch (e) {
            Alert.alert('Error', apiErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Screen>
            <ScrollView
                contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>
                    Checkout
                </Text>
                <Card>
                    <Text style={[typography.subtitle, { color: colors.text, marginBottom: 8 }]}>
                        Shipping Address
                    </Text>
                    <TextInput
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Address"
                        placeholderTextColor={colors.textFaint}
                        style={styles.input}
                    />
                    <TextInput
                        value={city}
                        onChangeText={setCity}
                        placeholder="City"
                        placeholderTextColor={colors.textFaint}
                        style={styles.input}
                    />
                    <TextInput
                        value={pincode}
                        onChangeText={setPincode}
                        placeholder="Pincode"
                        placeholderTextColor={colors.textFaint}
                        style={styles.input}
                    />
                </Card>
                <Button
                    title="Place Order"
                    loading={loading}
                    onPress={placeOrder}
                />
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    input: {
        marginTop: 8,
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: colors.text,
        fontSize: 14,
    },
});
