import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '@/components/ui/Button';
import OtpInput from '@/components/ui/OtpInput';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { SessionUser } from '@/lib/session';

export default function OtpVerifyScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const params = useLocalSearchParams<{ identifier?: string }>();
    const identifier = params.identifier ?? '';
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [seconds, setSeconds] = useState(30);

    useEffect(() => {
        if (seconds <= 0) return;
        const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [seconds]);

    const finishLogin = async (token: string, user: SessionUser) => {
        await login(token, user);
        router.replace('/(tabs)/');
    };

    const verify = async () => {
        if (code.replace(/\s/g, '').length !== 6) return;
        setLoading(true);
        try {
            const { data } = await api.post('/auth/otp/verify', {
                identifier,
                code: code.trim(),
            });

            await finishLogin(data.token, data.user);
        } catch (e) {
            Alert.alert('Verification failed', apiErrorMessage(e), [
                { text: 'OK' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const resend = () => {
        router.back();
        setSeconds(30);
    };

    return (
        <Screen>
            <View style={{ gap: 8, marginTop: '22%', alignItems: 'center' }}>
                <Text style={{ fontSize: 40 }}>📩</Text>
                <Text
                    style={[
                        typography.hero,
                        { color: colors.text, fontSize: 24 },
                    ]}
                >
                    Enter the code
                </Text>
                <Text
                    style={[
                        typography.body,
                        { color: colors.textDim, textAlign: 'center' },
                    ]}
                >
                    Sent to {identifier || 'your contact'}
                </Text>
            </View>

            <OtpInput
                code={code}
                onChange={setCode}
                style={{ marginTop: 32 }}
            />

            <Button
                title="Verify & continue"
                disabled={code.replace(/\s/g, '').length !== 6}
                loading={loading}
                onPress={verify}
            />

            <Pressable
                onPress={resend}
                disabled={seconds > 0}
                style={{ alignItems: 'center', marginTop: 8 }}
            >
                <Text
                    style={[
                        typography.small,
                        { color: seconds > 0 ? colors.textFaint : colors.gold },
                    ]}
                >
                    {seconds > 0 ? `Resend code in ${seconds}s` : 'Resend code'}
                </Text>
            </Pressable>
        </Screen>
    );
}

const styles = StyleSheet.create({
    resend: { alignItems: 'center', marginTop: 8 },
});
