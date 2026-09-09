import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import {
    registerForPushNotificationsAsync,
    sendDeviceTokenToBackend,
} from '@/lib/notifications';

export function useNotifications() {
    const [token, setToken] = useState<string | null>(null);
    const [permission, setPermission] = useState<
        'granted' | 'denied' | 'undetermined'
    >('undetermined');

    useEffect(() => {
        (async () => {
            const pushToken = await registerForPushNotificationsAsync();
            setToken(pushToken);
            if (pushToken) {
                await sendDeviceTokenToBackend(pushToken);
            }
            const { status } = await Notifications.getPermissionsAsync();
            setPermission(status as 'granted' | 'denied' | 'undetermined');
        })();
    }, []);

    return { token, permission };
}
