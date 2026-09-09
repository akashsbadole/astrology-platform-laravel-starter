import { ArrowRight, Mail, Phone } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

export default function OtpRequestScreen() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);

    const isPhone = /^[+\d][\d\s-]{6,}$/.test(identifier.trim());
    const valid = identifier.trim().length >= 6;

    const sendOtp = async () => {
        if (!valid) return;
        setLoading(true);
        try {
            const { data } = await api.post('/auth/otp/request', {
                identifier: identifier.trim(),
            });

            // In local mode the backend returns a debug_code for testing.
            if (data?.debug_code) {
                Alert.alert(
                    'OTP code (dev only)',
                    `Your code is ${data.debug_code} (expires in 5 min).\n\nIn production this arrives via SMS/email.`,
                    [{ text: 'OK', onPress: () => navigateToVerify() }],
                );
            } else {
                navigateToVerify();
            }
        } catch (e) {
            Alert.alert('Could not send code', apiErrorMessage(e), [
                { text: 'Retry' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const navigateToVerify = () => {
        router.push({
            pathname: '/otp-verify',
            params: { identifier: identifier.trim() },
        });
    };

    return (
        <Screen>
            <View style={{ gap: 8, marginTop: '20%' }}>
                <Text style={{ fontSize: 44 }}>🔮</Text>
                <Text style={[typography.hero, { color: colors.text }]}>
                    Welcome to AstroTalk
                </Text>
                <Text style={[typography.body, { color: colors.textDim }]}>
                    Enter your phone number or email — we'll send a 6-digit
                    code.
                </Text>
            </View>

            <View style={styles.inputWrap}>
                {isPhone ? (
                    <Phone color={colors.gold} size={18} />
                ) : (
                    <Mail color={colors.gold} size={18} />
                )}
                <TextInput
                    value={identifier}
                    onChangeText={setIdentifier}
                    placeholder="+91 98765 43210  or  you@email.com"
                    placeholderTextColor={colors.textFaint}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="username"
                    style={styles.input}
                />
            </View>

            <Button
                title="Send code"
                icon={<ArrowRight color="#1A1408" size={16} />}
                disabled={!valid}
                loading={loading}
                onPress={sendOtp}
            />

            <Text
                style={[
                    typography.tiny,
                    {
                        color: colors.textFaint,
                        textAlign: 'center',
                        marginTop: 8,
                    },
                ]}
            >
                New here? First OTP login creates your account automatically.
            </Text>

            <Pressable onPress={() => router.push('/')} style={styles.skip}>
                <Text style={[typography.small, { color: colors.textDim }]}>
                    Explore as guest
                </Text>
            </Pressable>
        </Screen>
    );
}

const styles = StyleSheet.create({
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 14,
        marginTop: 24,
        marginBottom: 16,
    },
    input: { flex: 1, color: colors.text, fontSize: 15 },
    skip: { alignItems: 'center', padding: 12 },
});
