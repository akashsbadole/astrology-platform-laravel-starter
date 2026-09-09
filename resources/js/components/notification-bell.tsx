import { router, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { useEffect } from 'react';
import { useEcho } from '@laravel/echo-react';
import { Button } from '@/components/ui/button';

export default function NotificationBell() {
    const { auth, unreadNotifications } = usePage<{
        auth: { user: { id: number } };
        unreadNotifications?: number;
    }>().props;

    const unread = unreadNotifications ?? 0;

    useEcho(
        `App.Models.User.${auth.user.id}`,
        'NotificationSent',
        () => {
            // Reload shared unread count without full navigation flicker.
            window.dispatchEvent(new CustomEvent('notification-received'));
        },
        [auth.user.id],
    );

    useEffect(() => {
        const handler = () => {
            // Inertia reload of shared props only.
            router.reload({ only: ['unreadNotifications'] });
        };
        window.addEventListener('notification-received', handler);
        return () =>
            window.removeEventListener('notification-received', handler);
    }, []);

    return (
        <Button variant="ghost" size="icon" asChild className="relative">
            <a href="/notifications" aria-label="Notifications">
                <Bell className="size-4" />
                {unread > 0 && (
                    <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px]">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </a>
        </Button>
    );
}
