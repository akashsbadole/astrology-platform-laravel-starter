import { Star, Clock } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, radius, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { inr } from '@/lib/format';

type Profile = {
    status: string;
    rejection_reason: string | null;
    bio: string | null;
    specializations: string[];
    languages: string[];
    experience_years: number;
    rate_chat_per_min: number;
    rate_call_per_min: number;
    rate_video_per_min: number;
    rating_avg: number;
    rating_count: number;
};

export default function AstrologerDashboardScreen() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [online, setOnline] = useState(false);

    useEffect(() => {
        void loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const { data } = await api.get('/astrologer/dashboard');
            setProfile(data?.profile ?? null);
            setOnline(data?.profile?.status === 'approved');
        } catch (e) {
            console.warn('Astrologer dashboard:', apiErrorMessage(e));
        }
    };

    const toggleOnline = async () => {
        const next = !online;
        setOnline(next);
        try {
            await api.put('/astrologer/status', { is_online: next });
        } catch (e) {
            setOnline(!next);
            console.warn('Status toggle:', apiErrorMessage(e));
        }
    };

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
                    Astrologer Dashboard
                </Text>
                {profile && (
                    <>
                        <Card>
                            <View style={styles.onlineRow}>
                                <View>
                                    <Text
                                        style={[
                                            typography.subtitle,
                                            { color: colors.text },
                                        ]}
                                    >
                                        Go Online
                                    </Text>
                                    <Text
                                        style={[
                                            typography.small,
                                            { color: colors.textDim },
                                        ]}
                                    >
                                        Accept new consultations
                                    </Text>
                                </View>
                                <Switch
                                    value={online}
                                    onValueChange={toggleOnline}
                                    trackColor={{ true: colors.gold }}
                                />
                            </View>
                        </Card>
                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Star color={colors.gold} size={20} />
                                <Text style={styles.statValue}>
                                    {profile.rating_avg.toFixed(1)}
                                </Text>
                                <Text style={styles.statLabel}>
                                    Rating ({profile.rating_count})
                                </Text>
                            </View>
                            <View style={styles.statBox}>
                                <Clock color={colors.gold} size={20} />
                                <Text style={styles.statValue}>
                                    {profile.experience_years}
                                </Text>
                                <Text style={styles.statLabel}>Years Exp</Text>
                            </View>
                        </View>
                        <Card>
                            <Text
                                style={[
                                    typography.subtitle,
                                    { color: colors.text, marginBottom: 8 },
                                ]}
                            >
                                Rates (per min)
                            </Text>
                            <View style={styles.rateRow}>
                                <Text
                                    style={[
                                        typography.body,
                                        { color: colors.textDim },
                                    ]}
                                >
                                    Chat
                                </Text>
                                <Text
                                    style={[
                                        typography.subtitle,
                                        { color: colors.gold },
                                    ]}
                                >
                                    {inr(profile.rate_chat_per_min)}
                                </Text>
                            </View>
                            <View style={styles.rateRow}>
                                <Text
                                    style={[
                                        typography.body,
                                        { color: colors.textDim },
                                    ]}
                                >
                                    Call
                                </Text>
                                <Text
                                    style={[
                                        typography.subtitle,
                                        { color: colors.gold },
                                    ]}
                                >
                                    {inr(profile.rate_call_per_min)}
                                </Text>
                            </View>
                            <View style={styles.rateRow}>
                                <Text
                                    style={[
                                        typography.body,
                                        { color: colors.textDim },
                                    ]}
                                >
                                    Video
                                </Text>
                                <Text
                                    style={[
                                        typography.subtitle,
                                        { color: colors.gold },
                                    ]}
                                >
                                    {inr(profile.rate_video_per_min)}
                                </Text>
                            </View>
                        </Card>
                        <Card>
                            <Text
                                style={[
                                    typography.subtitle,
                                    { color: colors.text, marginBottom: 4 },
                                ]}
                            >
                                Specializations
                            </Text>
                            <Text
                                style={[
                                    typography.body,
                                    { color: colors.textDim },
                                ]}
                            >
                                {profile.specializations.join(', ')}
                            </Text>
                            <Text
                                style={[
                                    typography.subtitle,
                                    {
                                        color: colors.text,
                                        marginTop: 12,
                                        marginBottom: 4,
                                    },
                                ]}
                            >
                                Languages
                            </Text>
                            <Text
                                style={[
                                    typography.body,
                                    { color: colors.textDim },
                                ]}
                            >
                                {profile.languages.join(', ')}
                            </Text>
                        </Card>
                    </>
                )}
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    onlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statsRow: { flexDirection: 'row', gap: 12 },
    statBox: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        gap: 4,
    },
    statValue: { color: colors.text, fontSize: 20, fontWeight: '800' },
    statLabel: { color: colors.textFaint, fontSize: 10, fontWeight: '700' },
    rateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
});
