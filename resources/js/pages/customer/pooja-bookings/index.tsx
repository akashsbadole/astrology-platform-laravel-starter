import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

type BookingRow = {
    id: number;
    pooja_name: string;
    scheduled_date: string;
    amount: string;
    status: string;
    payment_status: string;
};

type Props = { bookings: { data: BookingRow[] } };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer/dashboard' },
    { title: 'Pooja bookings', href: '/customer/pooja-bookings' },
];

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
    confirmed: 'default',
    pending_payment: 'secondary',
    completed: 'secondary',
    cancelled: 'destructive',
};

export default function PoojaBookingsIndex({ bookings }: Props) {
    return (
        <>
            <Head title="My Pooja bookings" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading title="My Pooja bookings" />

                {bookings.data.length === 0 ? (
                    <Card>
                        <CardContent className="text-muted-foreground py-10 text-center text-sm">
                            No pooja bookings yet.{' '}
                            <Link
                                href="/customer/poojas"
                                className="text-primary underline underline-offset-4"
                            >
                                Browse poojas
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {bookings.data.map((booking) => (
                            <Card key={booking.id}>
                                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                                    <div>
                                        <p className="font-medium">
                                            {booking.pooja_name}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            {booking.scheduled_date} · ₹
                                            {booking.amount}
                                        </p>
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
                                        {booking.status ===
                                            'pending_payment' && (
                                            <Button size="sm" asChild>
                                                <Link
                                                    href={`/customer/pooja-bookings/${booking.id}/checkout`}
                                                >
                                                    Pay now
                                                </Link>
                                            </Button>
                                        )}
                                        {(booking.status === 'confirmed' ||
                                            booking.status === 'completed') && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                asChild
                                            >
                                                <Link
                                                    href={`/customer/pooja-bookings/${booking.id}/chat`}
                                                >
                                                    Support chat
                                                </Link>
                                            </Button>
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

PoojaBookingsIndex.layout = { breadcrumbs };
