import {
    BookOpen,
    Calendar,
    ChevronRight,
    Flower2,
    LifeBuoy,
    LogIn,
    Moon,
    Scroll,
    Settings as SettingsIcon,
    ShoppingBag,
    Sparkles,
    MessageCircle,
    Gift,
    Bell,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Avatar from '@/components/ui/Avatar';
import Screen from '@/components/ui/Screen';
import {
    colors,
    gradient,
    radius,
    shadowCard,
    typography,
} from '@/constants/theme';
import { getUser, type SessionUser } from '@/lib/session';

const MENU = [
    { icon: MessageCircle, label: 'My Consults', to: '/consults' },
    { icon: Calendar, label: 'Bookings', to: '/bookings' },
    { icon: Scroll, label: 'My Kundlis', to: '/kundli' },
    { icon: Flower2, label: 'Pooja Bookings', to: '/pooja-bookings' },
    { icon: ShoppingBag, label: 'Orders', to: '/orders' },
    { icon: Bell, label: 'Notifications', to: '/notifications' },
    { icon: Gift, label: 'Referrals', to: '/referrals' },
    { icon: LifeBuoy, label: 'Support', to: '/support' },
    { icon: SettingsIcon, label: 'Settings', to: '/settings' },
] as const;

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<SessionUser | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <Screen>
            <ScrollView
                contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                {user ? (
                    <View style={styles.userRow}>
                        <Avatar name={user.name} size={56} online />
                        <View>
                            <Text
                                style={[
                                    typography.title,
                                    { color: colors.text },
                                ]}
                            >
                                {user.name}
                            </Text>
                            <Text
                                style={[
                                    typography.small,
                                    { color: colors.textDim },
                                ]}
                            >
                                {user.email ?? user.phone}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <LinearGradient
                        colors={gradient.violet}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.signin, shadowCard]}
                    >
                        <Moon color="#fff" size={28} />
                        <Text style={styles.signinTitle}>
                            Sign in to unlock everything
                        </Text>
                        <Text style={styles.signinSub}>
                            Consultations, wallet, bookings & more
                        </Text>
                        <Pressable
                            style={({ pressed }) => [
                                styles.signinBtn,
                                { opacity: pressed ? 0.8 : 1 },
                            ]}
                            onPress={() => router.push('/otp-request')}
                        >
                            <LogIn color="#1A1408" size={16} />
                            <Text style={styles.signinBtnText}>
                                Continue with OTP
                            </Text>
                        </Pressable>
                    </LinearGradient>
                )}

                <View style={styles.menuCard}>
                    {MENU.map(({ icon: Icon, label, to }, i) => (
                        <Pressable
                            key={to}
                            style={({ pressed }) => [
                                styles.row,
                                pressed && { opacity: 0.7 },
                            ]}
                            onPress={() => router.push(to)}
                        >
                            <View style={styles.rowIcon}>
                                <Icon color={colors.gold} size={17} />
                            </View>
                            <Text
                                style={[
                                    typography.body,
                                    {
                                        color: colors.text,
                                        flex: 1,
                                        fontWeight: '600',
                                    },
                                ]}
                            >
                                {label}
                            </Text>
                            <ChevronRight color={colors.textFaint} size={16} />
                            {i < MENU.length - 1 ? (
                                <View style={styles.divider} />
                            ) : null}
                        </Pressable>
                    ))}
                </View>

                <View style={styles.publicRow}>
                    <Text
                        style={[typography.tiny, { color: colors.textFaint }]}
                    >
                        EXPLORE FREE
                    </Text>
                    <View
                        style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}
                    >
                        {[
                            {
                                icon: Sparkles,
                                label: 'Horoscope',
                                to: '/horoscope',
                            },
                            { icon: BookOpen, label: 'Blog', to: '/blog' },
                            { icon: LifeBuoy, label: 'Forum', to: '/forum' },
                        ].map(({ icon: Icon, label, to }) => (
                            <Pressable
                                key={to}
                                style={({ pressed }) => [
                                    styles.publicChip,
                                    { opacity: pressed ? 0.7 : 1 },
                                ]}
                                onPress={() => router.push(to)}
                            >
                                <Icon color={colors.gold} size={14} />
                                <Text style={styles.publicChipText}>
                                    {label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <Text
                    style={[
                        typography.tiny,
                        {
                            color: colors.textFaint,
                            textAlign: 'center',
                            marginTop: 8,
                        },
                    ]}
                >
                    AstroTalk Mobile · API: Laravel · tracker §M0
                </Text>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginTop: 8,
    },
    signin: {
        borderRadius: radius.xl,
        padding: 22,
        gap: 6,
        alignItems: 'flex-start',
    },
    signinTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
        marginTop: 4,
    },
    signinSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
    signinBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
        backgroundColor: colors.gold,
        borderRadius: radius.pill,
        paddingHorizontal: 18,
        paddingVertical: 11,
    },
    signinBtnText: { color: '#1A1408', fontWeight: '800', fontSize: 13 },
    menuCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 14,
    },
    rowIcon: {
        width: 34,
        height: 34,
        borderRadius: 11,
        backgroundColor: colors.goldSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        position: 'absolute',
        left: 60,
        right: 14,
        bottom: 0,
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
    },
    publicRow: { marginTop: 4 },
    publicChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingVertical: 10,
    },
    publicChipText: { color: colors.textDim, fontSize: 12, fontWeight: '700' },
});
