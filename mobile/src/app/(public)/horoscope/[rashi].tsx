import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, radius, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type HoroscopeData = {
    rashi: string;
    period: string;
    horoscope: {
        title: string | null;
        body: string;
        lucky_color: string | null;
        lucky_number: string | null;
        lucky_time: string | null;
        date: string | null;
    } | null;
    rashis: string[];
};

const PERIODS = ['daily', 'weekly', 'monthly', 'yearly'] as const;

export default function HoroscopeDetailScreen() {
    const router = useRouter();
    const { rashi } = useLocalSearchParams<{ rashi: string }>();
    const [period, setPeriod] = useState<string>('daily');
    const [data, setData] = useState<HoroscopeData | null>(null);

    useEffect(() => {
        if (rashi) void loadHoroscope();
    }, [rashi, period]);

    const loadHoroscope = async () => {
        try {
            const { data } = await api.get(`/horoscope/${rashi}`, {
                params: { period },
            });
            setData(data ?? null);
        } catch (e) {
            console.warn('Horoscope detail:', apiErrorMessage(e));
        }
    };

    if (!data?.horoscope) {
        return (
            <Screen>
                <Text style={[typography.small, { color: colors.textDim }]}>
                    No horoscope available for {rashi} ({period}).
                </Text>
            </Screen>
        );
    }

    const h = data.horoscope;

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
                    {rashi}
                </Text>
                <View style={styles.periodRow}>
                    {PERIODS.map((p) => (
                        <Card
                            key={p}
                            style={[
                                styles.periodChip,
                                period === p && {
                                    backgroundColor: colors.gold + '22',
                                    borderColor: colors.gold,
                                },
                            ]}
                            onPress={() => setPeriod(p)}
                        >
                            <Text
                                style={[
                                    styles.periodText,
                                    {
                                        color:
                                            period === p
                                                ? colors.gold
                                                : colors.textDim,
                                    },
                                ]}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </Text>
                        </Card>
                    ))}
                </View>
                <Card>
                    <Text
                        style={[
                            typography.subtitle,
                            { color: colors.text, marginBottom: 8 },
                        ]}
                    >
                        {h.title || 'Horoscope'}
                    </Text>
                    <Text
                        style={[
                            typography.body,
                            { color: colors.text, lineHeight: 22 },
                        ]}
                    >
                        {h.body}
                    </Text>
                    <View style={styles.luckyRow}>
                        {h.lucky_color && (
                            <View style={styles.luckyItem}>
                                <Text
                                    style={[
                                        typography.small,
                                        { color: colors.textFaint },
                                    ]}
                                >
                                    Color
                                </Text>
                                <View
                                    style={[
                                        styles.colorDot,
                                        { backgroundColor: h.lucky_color },
                                    ]}
                                />
                            </View>
                        )}
                        {h.lucky_number && (
                            <View style={styles.luckyItem}>
                                <Text
                                    style={[
                                        typography.small,
                                        { color: colors.textFaint },
                                    ]}
                                >
                                    Number
                                </Text>
                                <Text
                                    style={[
                                        typography.subtitle,
                                        { color: colors.gold },
                                    ]}
                                >
                                    {h.lucky_number}
                                </Text>
                            </View>
                        )}
                        {h.lucky_time && (
                            <View style={styles.luckyItem}>
                                <Text
                                    style={[
                                        typography.small,
                                        { color: colors.textFaint },
                                    ]}
                                >
                                    Time
                                </Text>
                                <Text
                                    style={[
                                        typography.subtitle,
                                        { color: colors.gold },
                                    ]}
                                >
                                    {h.lucky_time}
                                </Text>
                            </View>
                        )}
                    </View>
                </Card>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    periodRow: { flexDirection: 'row', gap: 8 },
    periodChip: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    periodText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    luckyRow: { flexDirection: 'row', gap: 16, marginTop: 16 },
    luckyItem: { alignItems: 'center', gap: 4 },
    colorDot: { width: 24, height: 24, borderRadius: 12 },
});
