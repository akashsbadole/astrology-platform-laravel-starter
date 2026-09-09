import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type KundliOption = { id: number; profile_name: string };

export default function MilanIndexScreen() {
    const router = useRouter();
    const [kundlis, setKundlis] = useState<KundliOption[]>([]);
    const [aId, setAId] = useState<number | null>(null);
    const [bId, setBId] = useState<number | null>(null);

    useEffect(() => {
        void loadKundlis();
    }, []);

    const loadKundlis = async () => {
        try {
            const { data } = await api.get('/milan');
            setKundlis(data?.kundlis ?? []);
        } catch (e) {
            console.warn('Milan load:', apiErrorMessage(e));
        }
    };

    const match = async () => {
        if (!aId || !bId) return;
        router.push(`/milan/result?a=${aId}&b=${bId}`);
    };

    return (
        <Screen>
            <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>
                Milan
            </Text>
            <Card>
                <Text style={[typography.subtitle, { color: colors.text, marginBottom: 12 }]}>
                    Select two kundlis to match
                </Text>
                <FlatList
                    data={kundlis}
                    keyExtractor={(k) => String(k.id)}
                    contentContainerStyle={{ gap: 8 }}
                    renderItem={({ item }) => (
                        <Card
                            style={[
                                styles.kundliItem,
                                aId === item.id && { backgroundColor: colors.gold + '22', borderColor: colors.gold },
                                bId === item.id && { backgroundColor: colors.violet + '22', borderColor: colors.violet },
                            ]}
                            onPress={() => setAId(aId === item.id ? null : item.id)}
                        >
                            <Text style={[typography.body, { color: colors.text }]}>
                                {item.profile_name}
                            </Text>
                            {aId === item.id && (
                                <Text style={[typography.small, { color: colors.gold }]}>Partner A</Text>
                            )}
                            {bId === item.id && aId !== item.id && (
                                <Text style={[typography.small, { color: colors.violet }]}>Partner B</Text>
                            )}
                        </Card>
                    )}
                />
                <Button
                    title="Match"
                    disabled={!aId || !bId}
                    onPress={match}
                    style={{ marginTop: 16 }}
                />
            </Card>
        </Screen>
    );
}

const styles = StyleSheet.create({
    kundliItem: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
});
