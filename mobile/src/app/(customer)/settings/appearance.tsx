import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';

export default function SettingsAppearanceScreen() {
    const [theme, setTheme] = useState('dark');
    const [language, setLanguage] = useState('en');

    return (
        <Screen>
            <Text
                style={[typography.hero, { color: colors.text, fontSize: 24 }]}
            >
                Appearance
            </Text>
            <Card>
                <Text
                    style={[
                        typography.subtitle,
                        { color: colors.text, marginBottom: 12 },
                    ]}
                >
                    Theme
                </Text>
                {['light', 'dark', 'system'].map((t) => (
                    <Card
                        key={t}
                        style={[
                            styles.option,
                            theme === t && {
                                backgroundColor: colors.gold + '22',
                                borderColor: colors.gold,
                            },
                        ]}
                        onPress={() => setTheme(t as any)}
                    >
                        <Text style={[typography.body, { color: colors.text }]}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </Text>
                        {theme === t && (
                            <Text
                                style={[
                                    typography.small,
                                    { color: colors.gold },
                                ]}
                            >
                                Active
                            </Text>
                        )}
                    </Card>
                ))}
            </Card>
            <Card>
                <Text
                    style={[
                        typography.subtitle,
                        { color: colors.text, marginBottom: 12 },
                    ]}
                >
                    Language
                </Text>
                {['en', 'hi', 'ta', 'te'].map((lang) => (
                    <Card
                        key={lang}
                        style={[
                            styles.option,
                            language === lang && {
                                backgroundColor: colors.gold + '22',
                                borderColor: colors.gold,
                            },
                        ]}
                        onPress={() => setLanguage(lang)}
                    >
                        <Text style={[typography.body, { color: colors.text }]}>
                            {lang.toUpperCase()}
                        </Text>
                        {language === lang && (
                            <Text
                                style={[
                                    typography.small,
                                    { color: colors.gold },
                                ]}
                            >
                                Active
                            </Text>
                        )}
                    </Card>
                ))}
            </Card>
        </Screen>
    );
}

const styles = StyleSheet.create({
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        marginBottom: 8,
    },
});
