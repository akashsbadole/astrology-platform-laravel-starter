import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type Kundli = {
    id: number;
    profile_name: string;
    date_of_birth: string;
    birth_place: string;
    moon_rashi: string;
    moon_nakshatra: string;
};

export default function KundliListScreen() {
    const router = useRouter();
    const [kundlis, setKundlis] = useState<Kundli[]>([]);

    useEffect(() => {
        void loadKundlis();
    }, []);

    const loadKundlis = async () => {
        try {
            const { data } = await api.get('/kundli');
            setKundlis(data?.kundlis ?? []);
        } catch (e) {
            console.warn('Kundli list:', apiErrorMessage(e));
        }
    };

    return (
        <Screen>
            <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>
                Kundli
            </Text>
            <FlatList
                data={kundlis}
                keyExtractor={(k) => String(k.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Card onPress={() => router.push(`/kundli/${item.id}`)}>
                        <Text style={[typography.subtitle, { color: colors.text }]}>
                            {item.profile_name}
                        </Text>
                        <Text style={[typography.small, { color: colors.textDim }]}>
                            {item.date_of_birth} · {item.birth_place}
                        </Text>
                        <Text style={[typography.small, { color: colors.textFaint }]}>
                            {item.moon_rashi} · {item.moon_nakshatra}
                        </Text>
                    </Card>
                )}
                ListEmptyComponent={
                    <Card>
                        <Text style={[typography.small, { color: colors.textDim }]}>
                            No kundlis yet. Create your first one.
                        </Text>
                    </Card>
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({});
