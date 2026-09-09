import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
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
};

export default function LiveListScreen() {
    const router = useRouter();
    const [sessions, setSessions] = useState<LiveSession[]>([]);
    const [upcoming, setUpcoming] = useState<LiveSession[]>([]);

    useEffect(() => {
        void loadLive();
    }, []);

    const loadLive = async () => {
        try {
            const { data } = await api.get('/live');
            setSessions(data?.live ?? []);
            setUpcoming(data?.upcoming ?? []);
        } catch (e) {
            console.warn('Live load:', apiErrorMessage(e));
        }
    };

    const renderItem = (item: LiveSession) => (
        <Card key={item.id} onPress={() => router.push(`/live/${item.id}`)}>
            <Text style={[typography.subtitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
            </Text>
            <Text style={[typography.small, { color: colors.textDim }]}>
                {item.astrologer_name} · {item.entry_fee ? `₹${item.entry_fee}` : 'Free'}
            </Text>
            <View style={[styles.badge, { backgroundColor: item.status === 'live' ? colors.success + '22' : colors.gold + '22' }]}>
                <Text style={[styles.badgeText, { color: item.status === 'live' ? colors.success : colors.gold }]}>
                    {item.status.toUpperCase()}
                </Text>
            </View>
        </Card>
    );

    return (
        <Screen>
            <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>
                Live Sessions
            </Text>
            {sessions.length > 0 && (
                <>
                    <Text style={[typography.title, { color: colors.text, marginBottom: 8 }]}>
                        Live Now
                    </Text>
                    <FlatList
                        data={sessions}
                        keyExtractor={(s) => String(s.id)}
                        contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
                        renderItem={({ item }) => renderItem(item)}
                    />
                </>
            )}
            {upcoming.length > 0 && (
                <>
                    <Text style={[typography.title, { color: colors.text, marginBottom: 8 }]}>
                        Upcoming
                    </Text>
                    <FlatList
                        data={upcoming}
                        keyExtractor={(s) => String(s.id)}
                        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                        renderItem={({ item }) => renderItem(item)}
                    />
                </>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    badge: {
        alignSelf: 'flex-start',
        marginTop: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
});
