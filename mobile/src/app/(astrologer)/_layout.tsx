import {
    Calendar,
    ClipboardList,
    LayoutDashboard,
    User,
} from 'lucide-react-native';
import { Tabs } from 'expo-router';
import { colors } from '@/constants/theme';

export default function AstrologerTabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.gold,
                tabBarInactiveTintColor: colors.textDim,
                tabBarStyle: {
                    backgroundColor: colors.bg2,
                    borderTopColor: colors.border,
                    height: 64,
                    paddingTop: 8,
                    paddingBottom: 8,
                },
                tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
                sceneStyle: { backgroundColor: colors.bg },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <LayoutDashboard color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="availability"
                options={{
                    title: 'Availability',
                    tabBarIcon: ({ color, size }) => (
                        <Calendar color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="bookings"
                options={{
                    title: 'Bookings',
                    tabBarIcon: ({ color, size }) => (
                        <ClipboardList color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <User color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}
