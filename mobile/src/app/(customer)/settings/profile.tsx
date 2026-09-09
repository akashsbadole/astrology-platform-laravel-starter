import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsProfileScreen() {
    const { user } = useAuth();

    return (
        <Screen>
            <Text
                style={[typography.hero, { color: colors.text, fontSize: 24 }]}
            >
                Profile
            </Text>
            <Card>
                <Text style={[typography.subtitle, { color: colors.text }]}>
                    {user?.name}
                </Text>
                <Text style={[typography.small, { color: colors.textDim }]}>
                    {user?.email}
                </Text>
                <Text
                    style={[
                        typography.small,
                        { color: colors.textFaint, marginTop: 4 },
                    ]}
                >
                    Role: {user?.role}
                </Text>
            </Card>
        </Screen>
    );
}

const styles = StyleSheet.create({});
