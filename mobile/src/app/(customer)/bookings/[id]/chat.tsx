import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type Message = {
    id: number;
    sender_id: number;
    sender_name: string;
    body: string;
    created_at: string;
};
type Booking = {
    id: number;
    status: string;
    is_session_active: boolean;
    other_party_name: string;
};

export default function BookingChatScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        if (id) void loadChat();
    }, [id]);

    const loadChat = async () => {
        try {
            const { data } = await api.get(`/bookings/${id}/chat`);
            setBooking(data?.booking ?? null);
            setMessages(data?.messages ?? []);
        } catch (e) {
            console.warn('Chat load:', apiErrorMessage(e));
        }
    };

    return (
        <Screen>
            <Text
                style={[typography.hero, { color: colors.text, fontSize: 24 }]}
            >
                {booking?.other_party_name ?? 'Chat'}
            </Text>
            <FlatList
                data={messages}
                keyExtractor={(m) => String(m.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Card>
                        <Text
                            style={[
                                typography.subtitle,
                                { color: colors.text },
                            ]}
                        >
                            {item.sender_name}
                        </Text>
                        <Text
                            style={[typography.body, { color: colors.textDim }]}
                        >
                            {item.body}
                        </Text>
                        <Text
                            style={[
                                typography.tiny,
                                { color: colors.textFaint, marginTop: 4 },
                            ]}
                        >
                            {new Date(item.created_at).toLocaleString()}
                        </Text>
                    </Card>
                )}
                ListEmptyComponent={
                    <Card>
                        <Text
                            style={[
                                typography.small,
                                { color: colors.textDim },
                            ]}
                        >
                            {booking?.is_session_active
                                ? 'Chat is active. Send a message!'
                                : 'Chat is not active yet.'}
                        </Text>
                    </Card>
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({});
