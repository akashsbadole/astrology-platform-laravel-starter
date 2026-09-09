import { ArrowLeft, Send } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Avatar from '@/components/ui/Avatar';
import Screen from '@/components/ui/Screen';
import { colors, radius, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { timeAgo } from '@/lib/format';
import { useAuth } from '@/contexts/AuthContext';
import type { Consultation, ConsultationMessage } from '@/types';

export default function ChatScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const [consult, setConsult] = useState<Consultation | null>(null);
    const [messages, setMessages] = useState<ConsultationMessage[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const listRef = useRef<FlatList>(null);

    useEffect(() => {
        loadChat();
    }, [id]);

    const loadChat = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/consult/${id}`);
            setConsult(data?.consultation ?? null);
            setMessages(data?.messages ?? []);
        } catch (e) {
            console.warn('Chat load:', apiErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        const body = text.trim();
        if (!body || sending) return;
        setSending(true);
        setText('');
        try {
            const { data } = await api.post(`/consult/${id}/message`, { body });
            setMessages((prev) => [...prev, data]);
            setTimeout(() => listRef.current?.scrollToEnd(), 100);
        } catch (e) {
            console.warn('Send failed:', apiErrorMessage(e));
        } finally {
            setSending(false);
        }
    };

    const otherName = consult
        ? user?.role === 'customer'
            ? (consult.astrologer?.name ?? 'Astrologer')
            : (consult.customer?.name ?? 'Customer')
        : '';

    return (
        <Screen padded={false}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.back}>
                    <ArrowLeft color={colors.text} size={22} />
                </Pressable>
                <Avatar name={otherName} size={36} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerName} numberOfLines={1}>
                        {otherName || 'Chat'}
                    </Text>
                    {consult ? (
                        <Text style={styles.headerSub}>
                            {consult.type.toUpperCase()} · {consult.status}
                        </Text>
                    ) : null}
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingWrap}>
                    <Text style={[typography.body, { color: colors.textDim }]}>
                        Loading messages…
                    </Text>
                </View>
            ) : (
                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={(m) => String(m.id)}
                    contentContainerStyle={styles.msgList}
                    renderItem={({ item }) => {
                        const mine = item.sender_id === user?.id;
                        return (
                            <View
                                style={[
                                    styles.msgRow,
                                    mine && styles.msgRowMine,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.bubble,
                                        mine
                                            ? styles.bubbleMine
                                            : styles.bubbleTheirs,
                                    ]}
                                >
                                    <Text
                                        style={
                                            mine
                                                ? styles.txtMine
                                                : styles.txtTheirs
                                        }
                                    >
                                        {item.body}
                                    </Text>
                                </View>
                                <Text style={styles.msgTime}>
                                    {timeAgo(item.created_at)}
                                </Text>
                            </View>
                        );
                    }}
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <Text style={{ fontSize: 40 }}>💬</Text>
                            <Text
                                style={[
                                    typography.subtitle,
                                    { color: colors.text, marginTop: 8 },
                                ]}
                            >
                                No messages yet
                            </Text>
                            <Text
                                style={[
                                    typography.small,
                                    {
                                        color: colors.textDim,
                                        textAlign: 'center',
                                    },
                                ]}
                            >
                                Send a message to start the conversation.
                            </Text>
                        </View>
                    }
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.inputBar}
            >
                <TextInput
                    value={text}
                    onChangeText={setText}
                    placeholder="Type a message…"
                    placeholderTextColor={colors.textFaint}
                    style={styles.input}
                    multiline
                />
                <Pressable
                    onPress={sendMessage}
                    disabled={!text.trim() || sending}
                    style={({ pressed }) => [
                        styles.sendBtn,
                        {
                            opacity:
                                !text.trim() || sending
                                    ? 0.4
                                    : pressed
                                      ? 0.8
                                      : 1,
                        },
                    ]}
                >
                    <Send color="#1A1408" size={18} />
                </Pressable>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        paddingTop: 48,
        backgroundColor: colors.bg2,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    back: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
    },
    headerName: { color: colors.text, fontWeight: '700', fontSize: 16 },
    headerSub: { color: colors.textFaint, fontSize: 11, fontWeight: '600' },
    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    msgList: { padding: 16, gap: 12 },
    msgRow: { alignItems: 'flex-start', gap: 4 },
    msgRowMine: { alignItems: 'flex-end' },
    bubble: {
        maxWidth: '80%',
        borderRadius: radius.lg,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    bubbleMine: { backgroundColor: colors.gold, borderBottomRightRadius: 4 },
    bubbleTheirs: {
        backgroundColor: colors.surface,
        borderBottomLeftRadius: 4,
    },
    txtMine: { color: '#1A1408', fontSize: 14, fontWeight: '500' },
    txtTheirs: { color: colors.text, fontSize: 14 },
    msgTime: { color: colors.textFaint, fontSize: 10, marginHorizontal: 4 },
    emptyWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 4,
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
        padding: 12,
        backgroundColor: colors.bg2,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
    },
    input: {
        flex: 1,
        maxHeight: 100,
        backgroundColor: colors.surface,
        borderRadius: radius.pill,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: colors.text,
        fontSize: 14,
    },
    sendBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: colors.gold,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
