import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type Placement = {
    planet: string;
    rashi: string;
    nakshatra: string;
    degree: number;
};

type KundliData = {
    kundli: {
        id: number;
        profile_name: string;
        date_of_birth: string;
        time_of_birth: string;
        birth_place: string;
        ascendant_rashi: string;
        ayanamsa: number;
    };
    placements: Placement[];
    dashaTimeline: Array<{ period: string; start: string; end: string }>;
};

export default function KundliShowScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [kundli, setKundli] = useState<KundliData | null>(null);

    useEffect(() => {
        if (id) void loadKundli();
    }, [id]);

    const loadKundli = async () => {
        try {
            const { data } = await api.get(`/kundli/${id}`);
            setKundli(data ?? null);
        } catch (e) {
            console.warn('Kundli detail:', apiErrorMessage(e));
        }
    };

    if (!kundli) {
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
                    {kundli.kundli.profile_name}
                </Text>
                <Card>
                    <Text
                        style={[typography.small, { color: colors.textFaint }]}
                    >
                        {kundli.kundli.date_of_birth} ·{' '}
                        {kundli.kundli.time_of_birth} ·{' '}
                        {kundli.kundli.birth_place}
                    </Text>
                    <Text
                        style={[
                            typography.subtitle,
                            { color: colors.text, marginTop: 8 },
                        ]}
                    >
                        Ascendant: {kundli.kundli.ascendant_rashi}
                    </Text>
                    <Text style={[typography.small, { color: colors.textDim }]}>
                        Ayanamsa: {kundli.kundli.ayanamsa}°
                    </Text>
                </Card>
                <Text style={[typography.title, { color: colors.text }]}>
                    Planets
                </Text>
                {kundli.placements.map((p, i) => (
                    <Card key={i}>
                        <Text
                            style={[
                                typography.subtitle,
                                { color: colors.text },
                            ]}
                        >
                            {p.planet}
                        </Text>
                        <Text
                            style={[
                                typography.small,
                                { color: colors.textDim },
                            ]}
                        >
                            {p.rashi} · {p.nakshatra} · {p.degree.toFixed(2)}°
                        </Text>
                    </Card>
                ))}
                <Text
                    style={[
                        typography.title,
                        { color: colors.text, marginTop: 8 },
                    ]}
                >
                    Dasha Timeline
                </Text>
                {kundli.dashaTimeline.map((d, i) => (
                    <Card key={i}>
                        <Text
                            style={[
                                typography.subtitle,
                                { color: colors.text },
                            ]}
                        >
                            {d.period}
                        </Text>
                        <Text
                            style={[
                                typography.small,
                                { color: colors.textDim },
                            ]}
                        >
                            {d.start} → {d.end}
                        </Text>
                    </Card>
                ))}
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({});
