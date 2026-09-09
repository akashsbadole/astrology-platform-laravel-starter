import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, radius, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type MatchResult = {
    a: { id: number; name: string };
    b: { id: number; name: string };
    result: {
        total_score: number;
        max_score: number;
        percentage: number;
        verdict: string;
        factors: Array<{ name: string; score: number; max: number }>;
    };
};

export default function MilanResultScreen() {
    const { a, b } = useLocalSearchParams<{ a: string; b: string }>();
    const [data, setData] = useState<MatchResult | null>(null);

    useEffect(() => {
        if (a && b) void loadResult();
    }, [a, b]);

    const loadResult = async () => {
        try {
            const { data } = await api.post('/milan', { a_id: Number(a), b_id: Number(b) });
            setData(data ?? null);
        } catch (e) {
            console.warn('Milan result:', apiErrorMessage(e));
        }
    };

    if (!data) {
        return (
            <Screen>
                <Text style={[typography.small, { color: colors.textDim }]}>Loading…</Text>
            </Screen>
        );
    }

    return (
        <Screen>
            <ScrollView
                contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>
                    Milan Result
                </Text>
                <Text style={[typography.small, { color: colors.textFaint }]}>
                    {data.a.name} & {data.b.name}
                </Text>
                <Card>
                    <Text style={[typography.subtitle, { color: colors.text, marginBottom: 8 }]}>
                        Compatibility
                    </Text>
                    <Text style={[typography.hero, { color: colors.gold, fontSize: 48 }]}>
                        {data.result.percentage}%
                    </Text>
                    <Text style={[typography.body, { color: colors.textDim, marginTop: 8 }]}>
                        {data.result.verdict}
                    </Text>
                    <View style={styles.scoreBar}>
                        <View
                            style={[
                                styles.scoreFill,
                                { width: `${data.result.percentage}%`, backgroundColor: colors.gold },
                            ]}
                        />
                    </View>
                </Card>
                <Text style={[typography.title, { color: colors.text }]}>Factors</Text>
                {data.result.factors.map((f, i) => (
                    <Card key={i}>
                        <View style={styles.factorRow}>
                            <Text style={[typography.body, { color: colors.text }]}>
                                {f.name}
                            </Text>
                            <Text style={[typography.subtitle, { color: colors.gold }]}>
                                {f.score}/{f.max}
                            </Text>
                        </View>
                    </Card>
                ))}
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    scoreBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.surface,
        overflow: 'hidden',
        marginTop: 12,
    },
    scoreFill: { height: '100%', borderRadius: 4 },
    factorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
});
