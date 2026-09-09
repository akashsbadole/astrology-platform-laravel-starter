import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

type BookingRow = {
    id: number;
    customer_name: string;
    consultation_type: string;
    scheduled_at: string;
    duration_minutes: number;
    amount: string;
    status: string;
    payment_status: string;
    is_session_active: boolean;
    customer_notes: string | null;
};

type Props = {
    bookings: { data: BookingRow[] };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/astrologer/dashboard' },
    { title: 'My bookings', href: '/astrologer/bookings' },
];

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
    confirmed: 'default',
    pending_payment: 'secondary',
    completed: 'secondary',
    cancelled: 'destructive',
};

export default function AstrologerBookingsIndex({ bookings }: Props) {
    const complete = (id: number) => {
        router.patch(
            `/astrologer/bookings/${id}/complete`,
            {},
            { preserveScroll: true },
        );
    };

    const cancel = (id: number) => {
        if (!window.confirm('Cancel this booking?')) {
            return;
        }
        router.patch(
            `/astrologer/bookings/${id}/cancel`,
            {},
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="My bookings" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading title="My bookings" />

                {bookings.data.length === 0 ? (
                    <Card>
                        <CardContent className="text-muted-foreground py-10 text-center text-sm">
                            No bookings yet.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {bookings.data.map((booking) => (
                            <Card key={booking.id}>
                                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                                    <div>
                                        <p className="font-medium">
                                            {booking.customer_name}
                                        </p>
                                        <p className="text-muted-foreground text-sm capitalize">
                                            {booking.consultation_type} ·{' '}
                                            {new Date(
                                                booking.scheduled_at,
                                            ).toLocaleString()}{' '}
                                            · {booking.duration_minutes} min · ₹
                                            {booking.amount}
                                        </p>
                                        {booking.customer_notes && (
                                            <p className="text-muted-foreground mt-1 text-sm italic">
                                                "{booking.customer_notes}"
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={
                                                statusVariant[booking.status] ??
                                                'secondary'
                                            }
                                            className="capitalize"
                                        >
                                            {booking.status.replace('_', ' ')}
                                        </Badge>
                                        {booking.is_session_active && (
                                            <Button size="sm" asChild>
                                                <Link
                                                    href={`/bookings/${booking.id}/chat`}
                                                >
                                                    Join chat
                                                </Link>
                                            </Button>
                                        )}
                                        {!booking.is_session_active &&
                                            (booking.status === 'confirmed' ||
                                                booking.status ===
                                                    'completed') && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/bookings/${booking.id}/chat`}
                                                    >
                                                        View chat
                                                    </Link>
                                                </Button>
                                            )}
                                        {booking.status === 'confirmed' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        complete(booking.id)
                                                    }
                                                >
                                                    Mark completed
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        cancel(booking.id)
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

AstrologerBookingsIndex.layout = { breadcrumbs };
