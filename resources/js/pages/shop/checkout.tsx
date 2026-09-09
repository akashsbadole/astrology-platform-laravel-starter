import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => {
            open: () => void;
        };
    }
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Checkout', href: '#' }];

export default function ShopCheckout({
    order,
    razorpayKeyId,
    razorpayOrder,
}: {
    order: { id: number; total: number };
    razorpayKeyId: string | null;
    razorpayOrder: { id: string; amount: number };
}) {
    const [busy, setBusy] = useState(false);

    const pay = async () => {
        if (!razorpayKeyId) {
            alert('Razorpay not configured.');
            return;
        }
        setBusy(true);
        try {
            if (!window.Razorpay) {
                const s = document.createElement('script');
                s.src = 'https://checkout.razorpay.com/v1/checkout.js';
                document.body.appendChild(s);
                await new Promise((r) => {
                    s.onload = r;
                });
            }
            const rz = new window.Razorpay({
                key: razorpayKeyId,
                amount: razorpayOrder.amount,
                order_id: razorpayOrder.id,
                handler: (r: {
                    razorpay_order_id: string;
                    razorpay_payment_id: string;
                    razorpay_signature: string;
                }) => {
                    router.post(`/shop/orders/${order.id}/verify`, r);
                },
            });
            rz.open();
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <Head title="Checkout" />
            <div className="mx-auto max-w-md space-y-4 p-4">
                <Heading
                    title={`Pay ₹${order.total}`}
                    description="Wallet failed — pay via Razorpay, verified instantly."
                />
                <Card>
                    <CardContent className="space-y-2 py-4 text-sm">
                        <p>
                            Order #{order.id} · Razorpay order{' '}
                            {razorpayOrder.id}
                        </p>
                        <Button onClick={pay} disabled={busy}>
                            Pay now
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
ShopCheckout.layout = { breadcrumbs };
