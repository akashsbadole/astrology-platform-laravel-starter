import { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
    useNotifications();

    useEffect(() => {
        (async () => {
            const { addNotificationReceivedListener, addNotificationResponseReceivedListener } = await import('expo-notifications');
            const receivedSubscription = addNotificationReceivedListener((notification) => {
                console.log('Notification received:', notification);
            });
            const responseSubscription = addNotificationResponseReceivedListener((response) => {
                console.log('Notification tapped:', response);
                const data = response.notification.request.content.data;
                if (data?.consultationId) {
                    // router.push(`/consults/${data.consultationId}`);
                }
            });
            return () => {
                receivedSubscription.remove();
                responseSubscription.remove();
            };
        })();
    }, []);

    return <>{children}</>;
}
