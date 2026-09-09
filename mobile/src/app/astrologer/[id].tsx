import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft,
    MessageCircle,
    Phone,
    Star,
    Video,
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import {
    colors,
    gradient,
    radius,
    shadowCard,
    typography,
} from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { inr } from '@/lib/format';
import type { Astrologer } from '@/lib/mock';

type Mode = 'chat' | 'call' | 'video';

const REVIEWS = [
    {
        name: 'Rahul M.',
        stars: 5,
        text: 'Extremely accurate reading. Guidance was practical and kind.',
    },
    {
        name: 'Priya S.',
        stars: 4,
        text: 'Good clarity on career questions. Predicted the timeline right.',
    },
];

export default function AstrologerDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [astrologer, setAstrologer] = useState<Astrologer | null>(null);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<Mode>('chat');
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        loadAstrologer();
    }, [id]);

    const loadAstrologer = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/astrologers/${id}`);
            setAstrologer(data?.data ?? data ?? null);
        } catch (e) {
            console.warn('Astrologer detail:', apiErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    const displayAstrologer = astrologer;

    const rates: Record<Mode, number | null> = {
        chat: displayAstrologer?.rate_chat_per_min ?? null,
        call: displayAstrologer?.rate_call_per_min ?? null,
        video: displayAstrologer?.rate_video_per_min ?? null,
    };
    const rate = rates[mode];

    const startConsult = async () => {
        if (!displayAstrologer) return;
        setStarting(true);
        try {
            const { data } = await api.post('/consultations', {
                astrologer_id: displayAstrologer.user_id,
                type: mode,
            });
            router.push(`/consults/${data.id}`);
        } catch (e) {
            Alert.alert('Consultation', apiErrorMessage(e));
        } finally {
            setStarting(false);
        }
    };

    if (loading || !displayAstrologer) {
        return (
            <Screen>
                <View style={styles.loadingWrap}>
                    <Text style={[typography.body, { color: colors.textDim }]}>
                        {loading
                            ? 'Loading astrologer…'
                            : 'Astrologer not found.'}
                    </Text>
                </View>
            </Screen>
        );
    }

    const a = displayAstrologer;

    return (
        <Screen padded={false}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                <LinearGradient
                    colors={gradient.violet}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.hero}
                >
                    <Pressable
                        onPress={() => router.back()}
                        style={styles.back}
                    >
                        <ChevronLeft color="#fff" size={22} />
                    </Pressable>
                    <View
                        style={{ alignItems: 'center', gap: 8, marginTop: 8 }}
                    >
                        <Avatar
                            name={astrologer.name}
                            size={84}
                            online={astrologer.is_online}
                        />
                        <Text style={styles.heroName}>{astrologer.name}</Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                            }}
                        >
                            <Star
                                color={colors.gold}
                                size={14}
                                fill={colors.gold}
                            />
                            <Text style={styles.heroRating}>
                                {astrologer.rating_avg.toFixed(1)}
                            </Text>
                            <Text style={styles.heroSub}>
                                ({astrologer.rating_count} reviews)
                            </Text>
                            {astrologer.is_first_free ? (
                                <Badge label="5 MIN FREE" tone="success" />
                            ) : null}
                        </View>
                    </View>
                </LinearGradient>

                <View style={{ padding: 16, gap: 14 }}>
                    <Card style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>
                                {astrologer.experience_years}+
                            </Text>
                            <Text style={styles.statLabel}>Years exp</Text>
                        </View>
                        <View style={styles.statDiv} />
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>
                                {astrologer.languages.length}
                            </Text>
                            <Text style={styles.statLabel}>Languages</Text>
                        </View>
                        <View style={styles.statDiv} />
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>
                                {astrologer.is_online ? 'Now' : '—'}
                            </Text>
                            <Text style={styles.statLabel}>Availability</Text>
                        </View>
                    </Card>

                    <View
                        style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 8,
                        }}
                    >
                        {astrologer.specializations.map((s) => (
                            <Badge key={s} label={s} tone="violet" />
                        ))}
                        {astrologer.languages.map((l) => (
                            <Badge key={l} label={l} />
                        ))}
                    </View>

                    <Part2
                        astrologer={astrologer}
                        mode={mode}
                        setMode={setMode}
                        rates={rates}
                    />

                    <Card>
                        <Text
                            style={[
                                typography.subtitle,
                                { color: colors.text, marginBottom: 6 },
                            ]}
                        >
                            About
                        </Text>
                        <Text
                            style={[
                                typography.body,
                                { color: colors.textDim, lineHeight: 21 },
                            ]}
                        >
                            {astrologer.bio}
                        </Text>
                    </Card>

                    <Part3 />
                </View>
            </ScrollView>

            <Part4
                mode={mode}
                rate={rate}
                name={astrologer.name}
                starting={starting}
                onStart={startConsult}
            />
        </Screen>
    );
}

function Part2({
    astrologer,
    mode,
    setMode,
    rates,
}: {
    astrologer: Astrologer;
    mode: Mode;
    setMode: (m: Mode) => void;
    rates: Record<Mode, number | null>;
}) {
    return (
        <>
            <View style={styles.modeRow}>
                {(['chat', 'call', 'video'] as Mode[]).map((m) => {
                    const Icon =
                        m === 'chat'
                            ? MessageCircle
                            : m === 'call'
                              ? Phone
                              : Video;
                    const active = mode === m;
                    return (
                        <Pressable
                            key={m}
                            onPress={() => setMode(m)}
                            style={[
                                styles.modeCard,
                                active && styles.modeActive,
                            ]}
                        >
                            <Icon
                                color={active ? '#1A1408' : colors.gold}
                                size={20}
                            />
                            <Text
                                style={[
                                    styles.modeLabel,
                                    active && { color: '#1A1408' },
                                ]}
                            >
                                {m.toUpperCase()}
                            </Text>
                            <Text
                                style={[
                                    styles.modeRate,
                                    active && { color: 'rgba(26,20,8,0.7)' },
                                ]}
                            >
                                {rates[m] ? `${inr(rates[m]!)}/min` : 'Free'}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <Card>
                <Text
                    style={[
                        typography.subtitle,
                        { color: colors.text, marginBottom: 8 },
                    ]}
                >
                    Availability
                </Text>
                {['Mon–Fri · 09:00 – 13:00', 'Sat · 10:00 – 14:00'].map(
                    (slot) => (
                        <View key={slot} style={styles.slotRow}>
                            <View style={styles.slotDot} />
                            <Text
                                style={[
                                    typography.small,
                                    { color: colors.textDim },
                                ]}
                            >
                                {slot}
                            </Text>
                        </View>
                    ),
                )}
                <Text
                    style={[
                        typography.tiny,
                        { color: colors.textFaint, marginTop: 6 },
                    ]}
                >
                    Scheduled slots sync from {astrologer.name.split(' ')[0]}'s
                    calendar (tracker §4.3).
                </Text>
            </Card>
        </>
    );
}

function Part3() {
    return (
        <Card>
            <Text
                style={[
                    typography.subtitle,
                    { color: colors.text, marginBottom: 10 },
                ]}
            >
                Recent reviews
            </Text>
            {REVIEWS.map((r) => (
                <View key={r.name} style={{ marginBottom: 10, gap: 3 }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            gap: 6,
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            style={[
                                typography.small,
                                { color: colors.text, fontWeight: '700' },
                            ]}
                        >
                            {r.name}
                        </Text>
                        <Text style={{ color: colors.gold, fontSize: 11 }}>
                            {'★'.repeat(r.stars)}
                        </Text>
                    </View>
                    <Text style={[typography.small, { color: colors.textDim }]}>
                        {r.text}
                    </Text>
                </View>
            ))}
        </Card>
    );
}

function Part4({
    mode,
    rate,
    name,
    starting,
    onStart,
}: {
    mode: Mode;
    rate: number | null;
    name: string;
    starting: boolean;
    onStart: () => void;
}) {
    void name;
    return (
        <View style={styles.ctaBar}>
            <View>
                <Text style={styles.ctaRate}>
                    {rate ? `${inr(rate)}/min` : 'FREE'}
                </Text>
                <Text style={styles.ctaLabel}>via {mode} · wallet billing</Text>
            </View>
            <Pressable
                onPress={onStart}
                disabled={starting}
                style={({ pressed }) => [
                    styles.ctaBtn,
                    { opacity: starting ? 0.6 : pressed ? 0.9 : 1 },
                ]}
            >
                <LinearGradient
                    colors={gradient.gold}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.ctaGrad}
                >
                    <Text style={styles.ctaText}>Start {mode}</Text>
                </LinearGradient>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    hero: {
        paddingTop: 54,
        paddingBottom: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    back: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.25)',
        marginLeft: 16,
    },
    heroName: { color: '#fff', fontSize: 22, fontWeight: '800' },
    heroRating: { color: '#fff', fontWeight: '800', fontSize: 13 },
    heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: 14,
    },
    stat: { alignItems: 'center', gap: 2 },
    statValue: { color: colors.text, fontWeight: '800', fontSize: 17 },
    statLabel: {
        color: colors.textFaint,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    statDiv: {
        width: StyleSheet.hairlineWidth,
        height: 30,
        backgroundColor: colors.border,
    },
    modeRow: { flexDirection: 'row', gap: 10 },
    modeCard: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
        paddingVertical: 14,
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
    },
    modeActive: { backgroundColor: colors.gold, borderColor: colors.gold },
    modeLabel: {
        color: colors.gold,
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.6,
    },
    modeRate: { color: colors.textDim, fontSize: 11, fontWeight: '600' },
    slotRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 4,
    },
    slotDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.success,
    },
    ctaBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingBottom: 24,
        backgroundColor: colors.bg2,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
    },
    ctaRate: { color: colors.gold, fontWeight: '900', fontSize: 18 },
    ctaLabel: { color: colors.textFaint, fontSize: 10, fontWeight: '600' },
    ctaBtn: { borderRadius: radius.pill, overflow: 'hidden', ...shadowCard },
    ctaGrad: { paddingHorizontal: 26, paddingVertical: 14 },
    ctaText: { color: '#1A1408', fontWeight: '900', fontSize: 15 },
});
