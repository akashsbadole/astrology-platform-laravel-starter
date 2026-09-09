import { useEffect, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, radius, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import type { AstrologerProfileData } from '@/types';

export default function AstrologerProfileEditScreen() {
    const [profile, setProfile] = useState<AstrologerProfileData | null>(null);
    const [specializations, setSpecializations] = useState<string[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        void loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data } = await api.get('/astrologer/profile');
            setProfile(data?.profile ?? null);
            setSpecializations(data?.specializationOptions ?? []);
            setLanguages(data?.languageOptions ?? []);
        } catch (e) {
            console.warn('Profile load:', apiErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    const save = async () => {
        if (!profile) return;
        setSaving(true);
        try {
            const { data } = await api.put('/astrologer/profile', {
                bio: profile.bio,
                specializations: profile.specializations,
                languages: profile.languages,
                experience_years: profile.experience_years,
                rate_chat_per_min: profile.rate_chat_per_min,
                rate_call_per_min: profile.rate_call_per_min,
                rate_video_per_min: profile.rate_video_per_min,
            });
            setProfile((prev) => (prev ? { ...prev, ...data?.profile } : prev));
            Alert.alert('Saved', 'Your profile has been updated.');
        } catch (e) {
            Alert.alert('Error', apiErrorMessage(e));
        } finally {
            setSaving(false);
        }
    };

    const toggleArrayItem = (key: 'specializations' | 'languages', value: string) => {
        setProfile((prev) => {
            if (!prev) return prev;
            const current = prev[key];
            const next = current.includes(value)
                ? current.filter((v) => v !== value)
                : [...current, value];
            return { ...prev, [key]: next };
        });
    };

    const Chip = ({
        label,
        selected,
        onPress,
    }: {
        label: string;
        selected: boolean;
        onPress: () => void;
    }) => (
        <Pressable
            onPress={onPress}
            style={[
                styles.chip,
                selected
                    ? { backgroundColor: colors.gold + '22', borderColor: colors.gold }
                    : { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
        >
            <Text
                style={[
                    styles.chipText,
                    { color: selected ? colors.gold : colors.textDim },
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );

    if (loading || !profile) {
        return (
            <Screen>
                <Text style={[typography.small, { color: colors.textDim }]}>
                    Loading profile…
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
                    style={[typography.hero, { color: colors.text, fontSize: 24 }]}
                >
                    Edit Profile
                </Text>

                {profile.status === 'rejected' && profile.rejection_reason && (
                    <Card>
                        <Text style={[typography.subtitle, { color: colors.danger }]}>
                            Rejection Reason
                        </Text>
                        <Text style={[typography.body, { color: colors.textDim, marginTop: 4 }]}>
                            {profile.rejection_reason}
                        </Text>
                    </Card>
                )}

                <Card>
                    <Text style={[typography.subtitle, { color: colors.text, marginBottom: 8 }]}>
                        Bio
                    </Text>
                    <ScrollView style={{ maxHeight: 120 }}>
                        <Text
                            style={[typography.body, { color: colors.textDim }]}
                        >
                            {profile.bio || 'No bio added yet.'}
                        </Text>
                    </ScrollView>
                    <View style={styles.fieldGroup}>
                        <Text style={[typography.body, { color: colors.text }]}>Experience (years)</Text>
                        <View style={styles.counterRow}>
                            <Pressable
                                style={styles.counterBtn}
                                onPress={() =>
                                    setProfile((p) =>
                                        p
                                            ? {
                                                  ...p,
                                                  experience_years: Math.max(0, p.experience_years - 1),
                                              }
                                            : p,
                                    )
                                }
                            >
                                <Text style={[typography.subtitle, { color: colors.text }]}>−</Text>
                            </Pressable>
                            <Text style={[typography.subtitle, { color: colors.text }]}>
                                {profile.experience_years}
                            </Text>
                            <Pressable
                                style={styles.counterBtn}
                                onPress={() =>
                                    setProfile((p) =>
                                        p
                                            ? {
                                                  ...p,
                                                  experience_years: p.experience_years + 1,
                                              }
                                            : p,
                                    )
                                }
                            >
                                <Text style={[typography.subtitle, { color: colors.text }]}>+</Text>
                            </Pressable>
                        </View>
                    </View>
                </Card>

                <Card>
                    <Text style={[typography.subtitle, { color: colors.text, marginBottom: 12 }]}>
                        Rates (₹ per min)
                    </Text>
                    <View style={styles.rateField}>
                        <Text style={[typography.body, { color: colors.text }]}>Chat</Text>
                        <View style={styles.rateInput}>
                            <Text style={[typography.body, { color: colors.textDim }]}>₹</Text>
                            <Text
                                style={[typography.subtitle, { color: colors.text, marginLeft: 4 }]}
                            >
                                {profile.rate_chat_per_min}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.rateField}>
                        <Text style={[typography.body, { color: colors.text }]}>Call</Text>
                        <View style={styles.rateInput}>
                            <Text style={[typography.body, { color: colors.textDim }]}>₹</Text>
                            <Text
                                style={[typography.subtitle, { color: colors.text, marginLeft: 4 }]}
                            >
                                {profile.rate_call_per_min}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.rateField}>
                        <Text style={[typography.body, { color: colors.text }]}>Video</Text>
                        <View style={styles.rateInput}>
                            <Text style={[typography.body, { color: colors.textDim }]}>₹</Text>
                            <Text
                                style={[typography.subtitle, { color: colors.text, marginLeft: 4 }]}
                            >
                                {profile.rate_video_per_min}
                            </Text>
                        </View>
                    </View>
                </Card>

                <Card>
                    <Text style={[typography.subtitle, { color: colors.text, marginBottom: 12 }]}>
                        Specializations
                    </Text>
                    <View style={styles.chipWrap}>
                        {specializations.map((s) => (
                            <Chip
                                key={s}
                                label={s}
                                selected={profile.specializations.includes(s)}
                                onPress={() => toggleArrayItem('specializations', s)}
                            />
                        ))}
                    </View>
                </Card>

                <Card>
                    <Text style={[typography.subtitle, { color: colors.text, marginBottom: 12 }]}>
                        Languages
                    </Text>
                    <View style={styles.chipWrap}>
                        {languages.map((l) => (
                            <Chip
                                key={l}
                                label={l}
                                selected={profile.languages.includes(l)}
                                onPress={() => toggleArrayItem('languages', l)}
                            />
                        ))}
                    </View>
                </Card>

                <Button
                    title="Save Changes"
                    loading={saving}
                    onPress={save}
                />
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    fieldGroup: { marginTop: 16 },
    counterRow: { flexDirection: 'row', alignItems: 'center', gap: 24, marginTop: 8 },
    counterBtn: {
        width: 36,
        height: 36,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rateField: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    rateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        paddingHorizontal: 12,
        paddingVertical: 8,
        minWidth: 100,
    },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: radius.pill,
        borderWidth: 1,
    },
    chipText: { fontSize: 12, fontWeight: '600' },
});
