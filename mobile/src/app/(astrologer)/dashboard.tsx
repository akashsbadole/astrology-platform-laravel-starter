import { Calendar, Clock, Star, Video } from 'lucide-react-native';
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

type Earnings = {
    total_paise: number;
    pending_paise: number;
    this_month_paise: number;
    total_consultations: number;
};

type StatusState = {
    is_online: boolean;
    accepts_chat: boolean;
    accepts_call: boolean;
    accepts_video: boolean;
};

export default function AstrologerDashboardScreen() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [earnings, setEarnings] = useState<Earnings | null>(null);
    const [status, setStatus] = useState<StatusState>({
        is_online: false,
        accepts_chat: true,
        accepts_call: true,
        accepts_video: false,
    });

    useEffect(() => {
        void loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const { data } = await api.get('/astrologer/dashboard');
            setProfile(data?.profile ?? null);
            setEarnings(data?.earnings ?? null);
            if (data?.profile && typeof data.profile === 'object') {
                setStatus((prev) => ({
                    ...prev,
                    is_online: data.profile.status === 'approved',
                }));
            }
            if (data?.is_online !== undefined) {
                setStatus((prev) => ({ ...prev, is_online: data.is_online }));
            }
        } catch (e) {
            console.warn('Astrologer dashboard:', apiErrorMessage(e));
        }
    };

    const updateStatus = async (patch: Partial<StatusState>) => {
        const next = { ...status, ...patch };
        setStatus(next);
        try {
            await api.post('/astrologer/status', next);
        } catch (e) {
            setStatus(status);
            console.warn('Status update:', apiErrorMessage(e));
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
                    Dashboard
                </Text>

                {earnings && (
                    <View style={styles.earningsGrid}>
                        <Card style={styles.earningCard}>
                            <Text style={styles.earningLabel}>Total Earnings</Text>
                            <Text style={styles.earningValue}>{inr(earnings.total_paise / 100)}</Text>
                        </Card>
                        <Card style={styles.earningCard}>
                            <Text style={styles.earningLabel}>Pending</Text>
                            <Text style={[styles.earningValue, { color: colors.gold }]}>
                                {inr(earnings.pending_paise / 100)}
                            </Text>
                        </Card>
                        <Card style={styles.earningCard}>
                            <Text style={styles.earningLabel}>This Month</Text>
                            <Text style={[styles.earningValue, { color: colors.success }]}>
                                {inr(earnings.this_month_paise / 100)}
                            </Text>
                        </Card>
                        <Card style={styles.earningCard}>
                            <Text style={styles.earningLabel}>Consultations</Text>
                            <Text style={styles.earningValue}>{earnings.total_consultations}</Text>
                        </Card>
                    </View>
                )}

                {profile && (
                    <>
                        <Card>
                            <Text
                                style={[
                                    typography.subtitle,
                                    { color: colors.text, marginBottom: 12 },
                                ]}
                            >
                                Availability
                            </Text>
                            <View style={styles.toggleRow}>
                                <View>
                                    <Text style={[typography.body, { color: colors.text }]}>
                                        Go Online
                                    </Text>
                                    <Text style={[typography.small, { color: colors.textDim }]}>
                                        Accept new consultations
                                    </Text>
                                </View>
                                <Switch
                                    value={status.is_online}
                                    onValueChange={(v) => updateStatus({ is_online: v })}
                                    trackColor={{ true: colors.gold }}
                                />
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.toggleRow}>
                                <View>
                                    <Text style={[typography.body, { color: colors.text }]}>
                                        Chat
                                    </Text>
                                </View>
                                <Switch
                                    value={status.accepts_chat}
                                    onValueChange={(v) => updateStatus({ accepts_chat: v })}
                                    trackColor={{ true: colors.gold }}
                                />
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.toggleRow}>
                                <View>
                                    <Text style={[typography.body, { color: colors.text }]}>
                                        Call
                                    </Text>
                                </View>
                                <Switch
                                    value={status.accepts_call}
                                    onValueChange={(v) => updateStatus({ accepts_call: v })}
                                    trackColor={{ true: colors.gold }}
                                />
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.toggleRow}>
                                <View>
                                    <Text style={[typography.body, { color: colors.text }]}>
                                        Video
                                    </Text>
                                </View>
                                <Switch
                                    value={status.accepts_video}
                                    onValueChange={(v) => updateStatus({ accepts_video: v })}
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
                                <Text style={[typography.body, { color: colors.textDim }]}>
                                    Chat
                                </Text>
                                <Text style={[typography.subtitle, { color: colors.gold }]}>
                                    {inr(profile.rate_chat_per_min)}
                                </Text>
                            </View>
                            <View style={styles.rateRow}>
                                <Text style={[typography.body, { color: colors.textDim }]}>
                                    Call
                                </Text>
                                <Text style={[typography.subtitle, { color: colors.gold }]}>
                                    {inr(profile.rate_call_per_min)}
                                </Text>
                            </View>
                            <View style={styles.rateRow}>
                                <Text style={[typography.body, { color: colors.textDim }]}>
                                    Video
                                </Text>
                                <Text style={[typography.subtitle, { color: colors.gold }]}>
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
                            <Text style={[typography.body, { color: colors.textDim }]}>
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
                            <Text style={[typography.body, { color: colors.textDim }]}>
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
    earningsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    earningCard: { width: '48%', paddingVertical: 14, gap: 4 },
    earningLabel: { color: colors.textDim, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    earningValue: { color: colors.text, fontSize: 18, fontWeight: '800' },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 2 },
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
