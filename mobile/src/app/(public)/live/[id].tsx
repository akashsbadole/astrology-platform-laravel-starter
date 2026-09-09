import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type LiveSession = {
    id: number;
    title: string;
    description: string;
    status: string;
    entry_fee: number;
    astrologer_name: string;
    isParticipant: boolean;
    messages: Array<{ id: number; sender_name: string; body: string }>;
};

export default function LiveShowScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [session, setSession] = useState<LiveSession | null>(null);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        if (id) void loadSession();
    }, [id]);

    const loadSession = async () => {
        try {
            const { data } = await api.get(`/live/${id}`);
            setSession(data?.session ?? null);
        } catch (e) {
            console.warn('Live show:', apiErrorMessage(e));
        }
    };

    const join = async () => {
        setJoining(true);
        try {
            await api.post(`/live/${id}/join`);
            setSession((prev) => prev ? { ...prev, isParticipant: true } : prev);
        } catch (e) {
            console.warn('Join live:', apiErrorMessage(e));
        } finally {
            setJoining(false);
        }
    };

    if (!session) {
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
                    {session.title}
                </Text>
                <Card>
                    <Text style={[typography.body, { color: colors.text }]}>
                        {session.description}
                    </Text>
                    <Text style={[typography.small, { color: colors.textDim, marginTop: 8 }]}>
                        {session.astrologer_name} · {session.entry_fee ? `₹${session.entry_fee}` : 'Free'}
                    </Text>
                    {!session.isParticipant && (
                        <Button
                            title="Join Session"
                            loading={joining}
                            onPress={join}
                            style={{ marginTop: 12 }}
                        />
                    )}
                    {session.isParticipant && (
                        <Text style={[typography.small, { color: colors.success, marginTop: 12 }]}>
                            You are in this session
                        </Text>
                    )}
                </Card>
                <Text style={[typography.title, { color: colors.text }]}>Messages</Text>
                {session.messages.map((m) => (
                    <Card key={m.id}>
                        <Text style={[typography.subtitle, { color: colors.text }]}>
                            {m.sender_name}
                        </Text>
                        <Text style={[typography.body, { color: colors.textDim }]}>
                            {m.body}
                        </Text>
                    </Card>
                ))}
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({});
