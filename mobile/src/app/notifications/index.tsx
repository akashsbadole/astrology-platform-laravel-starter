import { Bell, CheckCheck } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Screen from '@/components/ui/Screen';
import { colors, radius, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { timeAgo } from '@/lib/format';

type NotificationItem = {
    id: string;
    type: string;
    data: Record<string, unknown>;
    read_at: string | null;
    created_at: string;
};

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadNotifications();
    }, []);
    const loadNotifications = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data?.notifications?.data ?? []);
            setUnreadCount(data?.unreadCount ?? 0);
        } catch (e) {
            console.warn('Notifications load:', apiErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };
    const markRead = async (id: string) => {
        try {
            await api.post(`/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id
                        ? { ...n, read_at: new Date().toISOString() }
                        : n,
                ),
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch (e) {
            console.warn('Mark read:', apiErrorMessage(e));
        }
    };
    const markAllRead = async () => {
        try {
            await api.post('/notifications/read-all');
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: new Date().toISOString() })),
            );
            setUnreadCount(0);
        } catch (e) {
            console.warn('Mark all read:', apiErrorMessage(e));
        }
    };
    const getTitle = (n: NotificationItem) => {
        const d = n.data;
        return (
            (d['title'] as string) ??
            (d['subject'] as string) ??
            n.type.replace(/Notification$/, '')
        );
    };
    const getBody = (n: NotificationItem) => {
        const d = n.data;
        return (d['body'] as string) ?? (d['message'] as string) ?? '';
    };
    return (
        <Screen>
            <View style={styles.headerRow}>
                <View>
                    <Text
                        style={[
                            typography.hero,
                            { color: colors.text, fontSize: 24 },
                        ]}
                    >
                        Notifications
                    </Text>
                    <Text style={[typography.small, { color: colors.textDim }]}>
                        {unreadCount > 0
                            ? `${unreadCount} unread`
                            : 'All caught up'}
                    </Text>
                </View>
                {unreadCount > 0 && (
                    <Pressable onPress={markAllRead} style={styles.markAllBtn}>
                        <CheckCheck color={colors.gold} size={18} />
                        <Text style={styles.markAllText}>Read all</Text>
                    </Pressable>
                )}
            </View>
            <FlatList
                data={notifications}
                keyExtractor={(n) => n.id}
                contentContainerStyle={{
                    gap: 12,
                    paddingTop: 16,
                    paddingBottom: 24,
                }}
                showsVerticalScrollIndicator={false}
                refreshing={loading}
                onRefresh={loadNotifications}
                renderItem={({ item }) => {
                    const isUnread = !item.read_at;
                    return (
                        <Pressable
                            style={({ pressed }) => [
                                styles.card,
                                isUnread && styles.cardUnread,
                                { opacity: pressed ? 0.9 : 1 },
                            ]}
                            onPress={() => markRead(item.id)}
                        >
                            <View style={styles.topRow}>
                                <View
                                    style={[
                                        styles.iconWrap,
                                        isUnread && styles.iconUnread,
                                    ]}
                                >
                                    <Bell
                                        color={
                                            isUnread ? '#1A1408' : colors.gold
                                        }
                                        size={16}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={[
                                            typography.subtitle,
                                            { color: colors.text },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {getTitle(item)}
                                    </Text>
                                    <Text
                                        style={[
                                            typography.tiny,
                                            { color: colors.textFaint },
                                        ]}
                                    >
                                        {timeAgo(item.created_at)}
                                    </Text>
                                </View>
                                {isUnread && <View style={styles.unreadDot} />}
                            </View>
                            {getBody(item) ? (
                                <Text
                                    style={[
                                        typography.small,
                                        { color: colors.textDim },
                                    ]}
                                    numberOfLines={2}
                                >
                                    {getBody(item)}
                                </Text>
                            ) : null}
                        </Pressable>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={{ fontSize: 40 }}>🔔</Text>
                        <Text
                            style={[
                                typography.subtitle,
                                { color: colors.text, marginTop: 8 },
                            ]}
                        >
                            No notifications
                        </Text>
                        <Text
                            style={[
                                typography.small,
                                { color: colors.textDim, textAlign: 'center' },
                            ]}
                        >
                            You're all caught up.
                        </Text>
                    </View>
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    markAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.surface,
        borderRadius: radius.pill,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
    },
    markAllText: { color: colors.gold, fontWeight: '700', fontSize: 12 },
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: 14,
        gap: 8,
    },
    cardUnread: { backgroundColor: colors.surfaceStrong },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: colors.goldSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconUnread: { backgroundColor: colors.gold },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.gold,
    },
    empty: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 4,
    },
});
