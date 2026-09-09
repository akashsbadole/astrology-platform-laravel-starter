import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { getCsrfTokenFromCookie } from '@/lib/csrf';
import type { BreadcrumbItem } from '@/types';

type BookingSummary = {
    id: number;
    astrologer_name: string;
    consultation_type: string;
    scheduled_at: string;
    duration_minutes: number;
    amount: string;
    status: string;
    payment_status: string;
};

type Props = {
    booking: BookingSummary;
    razorpayKeyId: string | null;
};

type RazorpayResponse = {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
};

declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => {
            open: () => void;
        };
    }
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer/dashboard' },
    { title: 'My bookings', href: '/customer/bookings' },
    { title: 'Checkout', href: '#' },
];

function loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.Razorpay) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve();
        script.onerror = () =>
            reject(new Error('Failed to load Razorpay checkout script'));
        document.body.appendChild(script);
    });
}

export default function BookingCheckout({ booking, razorpayKeyId }: Props) {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pay = async () => {
        if (!razorpayKeyId) {
            setError(
                'Payments are not configured yet. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the server .env file.',
            );
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            await loadRazorpayScript();

            const orderResponse = await fetch(
                `/customer/bookings/${booking.id}/payment/order`,
                {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'X-XSRF-TOKEN': getCsrfTokenFromCookie(),
                    },
                },
            );

            if (!orderResponse.ok) {
                throw new Error(
                    'Could not start the payment. Please try again.',
                );
            }

            const order = await orderResponse.json();

            const razorpay = new window.Razorpay({
                key: order.key_id,
                amount: order.amount,
                currency: order.currency,
                order_id: order.order_id,
                name: 'Astrology Consultation',
                description: `${booking.consultation_type} session with ${booking.astrologer_name}`,
                handler: (response: RazorpayResponse) => {
                    router.post(
                        `/customer/bookings/${booking.id}/payment/verify`,
                        {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        },
                    );
                },
                modal: {
                    ondismiss: () => setProcessing(false),
                },
            });

            razorpay.open();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Something went wrong starting the payment.',
            );
            setProcessing(false);
        }
    };

    return (
        <>
            <Head title="Checkout" />
            <div className="mx-auto max-w-lg space-y-6 rounded-xl p-4">
                <Heading title="Confirm and pay" />

                <Card>
                    <CardHeader>
                        <CardTitle>Booking summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Astrologer
                            </span>
                            <span>{booking.astrologer_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Type</span>
                            <span className="capitalize">
                                {booking.consultation_type}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">When</span>
                            <span>
                                {new Date(
                                    booking.scheduled_at,
                                ).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Duration
                            </span>
                            <span>{booking.duration_minutes} minutes</span>
                        </div>
                        <div className="mt-2 flex justify-between border-t pt-2 text-base font-semibold">
                            <span>Total</span>
                            <span>₹{booking.amount}</span>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>
                )}

                <Button onClick={pay} disabled={processing} className="w-full">
                    {processing && <Spinner />}
                    Pay ₹{booking.amount}
                </Button>
            </div>
        </>
    );
}

BookingCheckout.layout = { breadcrumbs };
