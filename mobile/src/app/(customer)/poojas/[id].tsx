import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { inr } from '@/lib/format';

type PoojaDetail = {
    id: number;
    name: string;
    category: string;
    description: string;
    benefits: string;
    vidhi: string;
    samagri: string[];
    duration_minutes: number;
    price: number;
    is_online: boolean;
};

export default function PoojaDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [pooja, setPooja] = useState<PoojaDetail | null>(null);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        if (id) void loadPooja();
    }, [id]);

    const loadPooja = async () => {
        try {
            const { data } = await api.get(`/poojas/${id}`);
            setPooja(data?.pooja ?? null);
        } catch (e) {
            console.warn('Pooja detail:', apiErrorMessage(e));
        }
    };

    const book = async () => {
        setBooking(true);
        try {
            await api.post('/pooja-bookings', { pooja_id: Number(id) });
            Alert.alert('Success', 'Pooja booked successfully!');
        } catch (e) {
            Alert.alert('Error', apiErrorMessage(e));
        } finally {
            setBooking(false);
        }
    };

    if (!pooja) {
        return (
            <Screen>
                <Text style={[typography.small, { color: colors.textDim }]}>
                    Loading…
                </Text>
            </Screen>
        );
    }

    return (
        <Screen>
            <ScrollView
                contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                <Text
                    style={[
                        typography.hero,
                        { color: colors.text, fontSize: 24 },
                    ]}
                >
                    {pooja.name}
                </Text>
                <Card>
                    <Text
                        style={[
                            typography.subtitle,
                            { color: colors.text, marginBottom: 8 },
                        ]}
                    >
                        About
                    </Text>
                    <Text style={[typography.body, { color: colors.textDim }]}>
                        {pooja.description}
                    </Text>
                    <Text
                        style={[
                            typography.subtitle,
                            { color: colors.text, marginTop: 12 },
                        ]}
                    >
                        {inr(pooja.price / 100)}
                    </Text>
                </Card>
                <Card>
                    <Text
                        style={[
                            typography.subtitle,
                            { color: colors.text, marginBottom: 8 },
                        ]}
                    >
                        Benefits
                    </Text>
                    <Text style={[typography.body, { color: colors.textDim }]}>
                        {pooja.benefits}
                    </Text>
                </Card>
                <Card>
                    <Text
                        style={[
                            typography.subtitle,
                            { color: colors.text, marginBottom: 8 },
                        ]}
                    >
                        Vidhi
                    </Text>
                    <Text style={[typography.body, { color: colors.textDim }]}>
                        {pooja.vidhi}
                    </Text>
                    <Text
                        style={[
                            typography.subtitle,
                            { color: colors.text, marginTop: 12 },
                        ]}
                    >
                        Samagri
                    </Text>
                    {pooja.samagri.map((s, i) => (
                        <Text
                            key={i}
                            style={[
                                typography.small,
                                { color: colors.textDim },
                            ]}
                        >
                            • {s}
                        </Text>
                    ))}
                </Card>
                <Button
                    title={`Book for ${inr(pooja.price / 100)}`}
                    loading={booking}
                    onPress={book}
                />
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({});
