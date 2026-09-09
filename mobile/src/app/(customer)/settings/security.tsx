import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';

export default function SettingsSecurityScreen() {
    return (
        <Screen>
            <Text
                style={[typography.hero, { color: colors.text, fontSize: 24 }]}
            >
                Security
            </Text>
            <Card>
                <Text
                    style={[
                        typography.subtitle,
                        { color: colors.text, marginBottom: 8 },
                    ]}
                >
                    Password
                </Text>
                <Text style={[typography.small, { color: colors.textDim }]}>
                    Change your password
                </Text>
            </Card>
            <Card>
                <Text
                    style={[
                        typography.subtitle,
                        { color: colors.text, marginBottom: 8 },
                    ]}
                >
                    Two-Factor Authentication
                </Text>
                <Text style={[typography.small, { color: colors.textDim }]}>
                    Enable 2FA for extra security
                </Text>
            </Card>
            <Card>
                <Text
                    style={[
                        typography.subtitle,
                        { color: colors.text, marginBottom: 8 },
                    ]}
                >
                    Passkeys
                </Text>
                <Text style={[typography.small, { color: colors.textDim }]}>
                    Manage passkeys
                </Text>
            </Card>
        </Screen>
    );
}

const styles = StyleSheet.create({});
