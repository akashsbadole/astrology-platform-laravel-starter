import { ArrowRight, Mail, Phone } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
    setLoading(true);
    try {
      // Tracker §3.1: POST /auth/otp/request (JSON branch pending — §8.2).
      await api.post('/auth/otp/request', { identifier: identifier.trim() });
      router.push({ pathname: '/otp-verify', params: { identifier: identifier.trim() } });
    } catch (e) {
      Alert.alert('Demo mode', `${apiErrorMessage(e)}\n\nContinuing to verify screen anyway — backend token flow is tracked in §8.2.`, [
        { text: 'Continue', onPress: () => router.push({ pathname: '/otp-verify', params: { identifier: identifier.trim() } }) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={{ gap: 8, marginTop: '20%' }}>
        <Text style={{ fontSize: 44 }}>🔮</Text>
        <Text style={[typography.hero, { color: colors.text }]}>Welcome to AstroTalk</Text>
        <Text style={[typography.body, { color: colors.textDim }]}>
          Enter your phone number or email — we'll send a 6-digit code.
        </Text>
      </View>

      <View style={styles.inputWrap}>
        {isPhone ? <Phone color={colors.gold} size={18} /> : <Mail color={colors.gold} size={18} />}
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

      <Button title="Send code" icon={<ArrowRight color="#1A1408" size={16} />} disabled={!valid} loading={loading} onPress={sendOtp} />

      <Text style={[typography.tiny, { color: colors.textFaint, textAlign: 'center', marginTop: 8 }]}>
        New here? First OTP login creates your account automatically.
      </Text>

      <Pressable onPress={() => router.push('/')} style={styles.skip}>
        <Text style={[typography.small, { color: colors.textDim }]}>Explore as guest</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 14, marginTop: 24, marginBottom: 16,
  },
  input: { flex: 1, color: colors.text, fontSize: 15 },
  skip: { alignItems: 'center', padding: 12 },
});
