import { Bell, Moon, Globe, Shield, LogOut, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, radius, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
    const { logout, user } = useAuth();
    const [prefs, setPrefs] = useState({ email_enabled: true, sms_enabled: true, push_enabled: true });

    const togglePref = async (key: keyof typeof prefs) => {
        const next = { ...prefs, [key]: !prefs[key] };
        setPrefs(next);
        try {
            await api.put('/notifications/preferences', next);
        } catch (e) {
            setPrefs(prefs);
            Alert.alert('Error', apiErrorMessage(e));
        }
    };

    const handleLogout = () => {
        Alert.alert('Sign out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign out', style: 'destructive', onPress: logout },
        ]);
    };

    const menuItems = [
        { icon: Bell, label: 'Notification Preferences', action: () => {} },
        { icon: Shield, label: 'Privacy & Security', action: () => {} },
        { icon: Globe, label: 'Language', action: () => {} },
        { icon: Moon, label: 'Appearance', action: () => {} },
    ];

    return (
        <Screen>
            <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>Settings</Text>
                {user && (
                    <Card>
                        <Text style={[typography.subtitle, { color: colors.text }]}>{user.name}</Text>
                        <Text style={[typography.small, { color: colors.textDim }]}>{user.email ?? user.phone}</Text>
                        <Text style={[typography.tiny, { color: colors.gold, marginTop: 4 }]}>{user.role.toUpperCase()}</Text>
                    </Card>
                )}
                <Card>
                    <Text style={[typography.subtitle, { color: colors.text, marginBottom: 12 }]}>Notifications</Text>
                    <View style={styles.prefRow}>
                        <Text style={[typography.body, { color: colors.text }]}>Email</Text>
                        <Switch value={prefs.email_enabled} onValueChange={() => togglePref('email_enabled')} trackColor={{ true: colors.gold }} />
                    </View>
                    <View style={styles.prefRow}>
                        <Text style={[typography.body, { color: colors.text }]}>SMS</Text>
                        <Switch value={prefs.sms_enabled} onValueChange={() => togglePref('sms_enabled')} trackColor={{ true: colors.gold }} />
                    </View>
                    <View style={styles.prefRow}>
                        <Text style={[typography.body, { color: colors.text }]}>Push</Text>
                        <Switch value={prefs.push_enabled} onValueChange={() => togglePref('push_enabled')} trackColor={{ true: colors.gold }} />
                    </View>
                </Card>
                <Card>
                    {menuItems.map(({ icon: Icon, label, action }) => (
                        <View key={label} style={styles.menuRow}>
                            <Icon color={colors.gold} size={18} />
                            <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{label}</Text>
                            <ChevronRight color={colors.textFaint} size={16} />
                        </View>
                    ))}
                </Card>
                <Button title="Sign out" icon={<LogOut color="#1A1408" size={16} />} onPress={handleLogout} />
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    prefRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
    },
});
