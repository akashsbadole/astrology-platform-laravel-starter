import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { inr } from '@/lib/format';

type Pooja = { id: number; name: string; category: string; price: number; is_online: boolean };

export default function PoojaListScreen() {
    const router = useRouter();
    const [poojas, setPoojas] = useState<Pooja[]>([]);

    useEffect(() => {
        void loadPoojas();
    }, []);

    const loadPoojas = async () => {
        try {
            const { data } = await api.get('/poojas');
            setPoojas(data?.poojas ?? []);
        } catch (e) {
            console.warn('Poojas load:', apiErrorMessage(e));
        }
    };

    return (
        <Screen>
            <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>
                Poojas
            </Text>
            <FlatList
                data={poojas}
                keyExtractor={(p) => String(p.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Card onPress={() => router.push(`/poojas/${item.id}`)}>
                        <Text style={[typography.subtitle, { color: colors.text }]}>
                            {item.name}
                        </Text>
                        <Text style={[typography.small, { color: colors.textDim }]}>
                            {item.category} · {item.is_online ? 'Online' : 'Offline'}
                        </Text>
                        <Text style={[typography.subtitle, { color: colors.gold, marginTop: 4 }]}>
                            {inr(item.price / 100)}
                        </Text>
                    </Card>
                )}
                ListEmptyComponent={
                    <Card>
                        <Text style={[typography.small, { color: colors.textDim }]}>
                            No poojas available.
                        </Text>
                    </Card>
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({});
