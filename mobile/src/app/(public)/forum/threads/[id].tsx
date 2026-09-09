import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type Reply = { id: number; body: string; sender_name: string; created_at: string };

export default function ForumThreadScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [replies, setReplies] = useState<Reply[]>([]);

    useEffect(() => {
        if (id) void loadThread();
    }, [id]);

    const loadThread = async () => {
        try {
            const { data } = await api.get(`/forum/threads/${id}`);
            setReplies(data?.replies ?? []);
        } catch (e) {
            console.warn('Forum thread:', apiErrorMessage(e));
        }
    };

    return (
        <Screen>
            <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>
                Thread #{id}
            </Text>
            <FlatList
                data={replies}
                keyExtractor={(r) => String(r.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Card>
                        <Text style={[typography.subtitle, { color: colors.text }]}>
                            {item.sender_name}
                        </Text>
                        <Text style={[typography.body, { color: colors.textDim }]}>
                            {item.body}
                        </Text>
                        <Text style={[typography.tiny, { color: colors.textFaint, marginTop: 4 }]}>
                            {item.created_at}
                        </Text>
                    </Card>
                )}
                ListEmptyComponent={
                    <Card>
                        <Text style={[typography.small, { color: colors.textDim }]}>
                            No replies yet.
                        </Text>
                    </Card>
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({});
