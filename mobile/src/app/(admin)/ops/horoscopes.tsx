import { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type Horoscope = { id: number; rashi: string; period: string; title: string | null; date: string | null };

export default function AdminHoroscopesScreen() {
    const [items, setItems] = useState<Horoscope[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        try {
            const { data } = await api.get('/admin/ops/horoscopes');
            setItems(data?.items ?? []);
        } catch (e) {
            console.warn('Horoscopes load:', apiErrorMessage(e));
        }
    };

    const add = async () => {
        Alert.prompt('Add horoscope', 'Enter rashi, period, body (comma separated)', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Add',
                onPress: async (text) => {
                    if (!text) return;
                    const [rashi, period, body] = text.split(',');
                    try {
                        await api.post('/admin/ops/horoscopes', {
                            rashi: rashi?.trim(),
                            period: period?.trim() || 'daily',
                            body: body?.trim() || 'Default horoscope content.',
                        });
                        void load();
                    } catch (e) {
                        Alert.alert('Error', apiErrorMessage(e));
                    }
                },
            },
        ]);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    useEffect(() => { void load(); }, []);

    return (
        <Screen>
            <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>Horoscopes</Text>
            <FlatList
                data={items}
                keyExtractor={(h) => String(h.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Card>
                        <Text style={[typography.subtitle, { color: colors.text }]}>
                            {item.rashi} — {item.period}
                        </Text>
                        <Text style={[typography.small, { color: colors.textDim }]}>
                            {item.title || 'No title'}
                        </Text>
                    </Card>
                )}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
                ListEmptyComponent={
                    <Card>
                        <Text style={[typography.small, { color: colors.textDim }]}>No horoscopes yet.</Text>
                    </Card>
                }
            />
            <Button title="Add Horoscope" onPress={add} />
        </Screen>
    );
}
