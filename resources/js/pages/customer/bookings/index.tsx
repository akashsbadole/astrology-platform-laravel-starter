import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { ReviewForm } from '@/components/review-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

type BookingRow = {
    id: number;
    astrologer_name: string;
    consultation_type: string;
    scheduled_at: string;
    duration_minutes: number;
    amount: string;
    status: string;
    payment_status: string;
    is_session_active: boolean;
    has_review: boolean;
};

type Props = {
    bookings: { data: BookingRow[] };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer/dashboard' },
    { title: 'My bookings', href: '/customer/bookings' },
];

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
    confirmed: 'default',
    pending_payment: 'secondary',
    completed: 'secondary',
    cancelled: 'destructive',
};

export default function CustomerBookingsIndex({ bookings }: Props) {
    const [reviewOpenFor, setReviewOpenFor] = useState<number | null>(null);
    const [submittedFor, setSubmittedFor] = useState<number[]>([]);

    return (
        <>
            <Head title="My bookings" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading title="My bookings" />

                {bookings.data.length === 0 ? (
                    <Card>
                        <CardContent className="text-muted-foreground py-10 text-center text-sm">
                            You haven't booked a consultation yet.{' '}
                            <Link
                                href="/customer/astrologers"
                                className="text-primary underline underline-offset-4"
                            >
                                Browse astrologers
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {bookings.data.map((booking) => {
                            const reviewed =
                                booking.has_review ||
                                submittedFor.includes(booking.id);

                            return (
                                <Card key={booking.id}>
                                    <CardContent className="space-y-3 py-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p className="font-medium">
                                                    {booking.astrologer_name}
                                                </p>
                                                <p className="text-muted-foreground text-sm capitalize">
                                                    {booking.consultation_type}{' '}
                                                    ·{' '}
                                                    {new Date(
                                                        booking.scheduled_at,
                                                    ).toLocaleString()}{' '}
                                                    · {booking.duration_minutes}{' '}
                                                    min
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        statusVariant[
                                                            booking.status
                                                        ] ?? 'secondary'
                                                    }
                                                    className="capitalize"
                                                >
                                                    {booking.status.replace(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </Badge>
                                                {booking.status ===
                                                    'pending_payment' && (
                                                    <Button size="sm" asChild>
                                                        <Link
                                                            href={`/customer/bookings/${booking.id}/checkout`}
                                                        >
                                                            Pay now
                                                        </Link>
                                                    </Button>
                                                )}
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
                                                    (booking.status ===
                                                        'confirmed' ||
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
                                                {booking.status ===
                                                    'completed' &&
                                                    !reviewed && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                setReviewOpenFor(
                                                                    reviewOpenFor ===
                                                                        booking.id
                                                                        ? null
                                                                        : booking.id,
                                                                )
                                                            }
                                                        >
                                                            Leave a review
                                                        </Button>
                                                    )}
                                                {reviewed && (
                                                    <Badge variant="secondary">
                                                        Reviewed
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {reviewOpenFor === booking.id && (
                                            <div className="border-t pt-3">
                                                <ReviewForm
                                                    bookingId={booking.id}
                                                    onSubmitted={() => {
                                                        setSubmittedFor(
                                                            (current) => [
                                                                ...current,
                                                                booking.id,
                                                            ],
                                                        );
                                                        setReviewOpenFor(null);
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

CustomerBookingsIndex.layout = { breadcrumbs };
