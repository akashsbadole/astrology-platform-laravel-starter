import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type NotificationItem = {
    id: string;
    type: string;
    data: { title?: string; body?: string; url?: string };
    read_at: string | null;
    created_at: string;
};

type Props = {
    notifications: { data: NotificationItem[] };
    unreadCount: number;
    preferences: {
        email_enabled: boolean;
        sms_enabled: boolean;
        push_enabled: boolean;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Notifications', href: '/notifications' },
];

export default function NotificationsIndex({
    notifications,
    unreadCount,
    preferences,
}: Props) {
    const [prefs, setPrefs] = useState(preferences);

    const save = () => {
        router.put('/notifications/preferences', prefs, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Notifications" />
            <div className="mx-auto flex max-w-2xl flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            router.post(
                                '/notifications/read-all',
                                {},
                                { preserveScroll: true },
                            )
                        }
                    >
                        Mark all read
                    </Button>
                </div>

                <div className="space-y-2">
                    {notifications.data.length === 0 && (
                        <Card>
                            <CardContent className="text-muted-foreground py-8 text-center text-sm">
                                No notifications yet.
                            </CardContent>
                        </Card>
                    )}
                    {notifications.data.map((n) => (
                        <Card
                            key={n.id}
                            className={n.read_at ? 'opacity-70' : ''}
                        >
                            <CardContent className="flex items-start justify-between gap-3 py-3">
                                <div>
                                    <p className="text-sm font-medium">
                                        {n.data.title ?? n.type}
                                        {!n.read_at && (
                                            <Badge
                                                className="ml-2"
                                                variant="default"
                                            >
                                                New
                                            </Badge>
                                        )}
                                    </p>
                                    {n.data.body && (
                                        <p className="text-muted-foreground text-sm">
                                            {n.data.body}
                                        </p>
                                    )}
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        {new Date(
                                            n.created_at,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                        router.post(
                                            `/notifications/${n.id}/read`,
                                        )
                                    }
                                >
                                    Open
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {(
                            [
                                ['email_enabled', 'Email'],
                                ['sms_enabled', 'SMS'],
                                ['push_enabled', 'Push / in-app'],
                            ] as const
                        ).map(([key, label]) => (
                            <div key={key} className="flex items-center gap-2">
                                <Checkbox
                                    id={key}
                                    checked={prefs[key]}
                                    onCheckedChange={(checked) =>
                                        setPrefs((p) => ({
                                            ...p,
                                            [key]: checked === true,
                                        }))
                                    }
                                />
                                <Label htmlFor={key}>
                                    {label} notifications
                                </Label>
                            </div>
                        ))}
                        <Button size="sm" onClick={save}>
                            Save preferences
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

NotificationsIndex.layout = { breadcrumbs };
