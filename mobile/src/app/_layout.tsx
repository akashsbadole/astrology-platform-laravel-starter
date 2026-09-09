import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/theme';

import '../global.css';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
    return (
        <AuthProvider>
            <>
                <StatusBar style="light" />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: colors.bg },
                    }}
                >
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen
                        name="astrologer/[id]"
                        options={{ animation: 'slide_from_right' }}
                    />
                    <Stack.Screen
                        name="[...missing]"
                        options={{ animation: 'fade' }}
                    />
                </Stack>
            </>
        </AuthProvider>
    );
}
