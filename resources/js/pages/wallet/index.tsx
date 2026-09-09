import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getCsrfTokenFromCookie } from '@/lib/csrf';
import type { BreadcrumbItem } from '@/types';

declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => {
            open: () => void;
        };
    }
}

type Props = {
    balance: number;
    transactions: {
        data: Array<{
            id: number;
            type: string;
            amount: number;
            balance_after: number;
            created_at: string;
        }>;
    };
    razorpayKeyId: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Wallet', href: '/wallet' }];

export default function WalletIndex({
    balance,
    transactions,
    razorpayKeyId,
}: Props) {
    const [amount, setAmount] = useState('500');
    const [coupon, setCoupon] = useState('');
    const [busy, setBusy] = useState(false);

    const recharge = async () => {
        if (!razorpayKeyId) {
            alert('Razorpay not configured. Set RAZORPAY_KEY_ID/SECRET.');
            return;
        }
        setBusy(true);
        try {
            const s = document.createElement('script');
            if (!window.Razorpay) {
                s.src = 'https://checkout.razorpay.com/v1/checkout.js';
                document.body.appendChild(s);
                await new Promise((r) => {
                    s.onload = r;
                });
            }
            const res = await fetch('/wallet/order', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getCsrfTokenFromCookie(),
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    coupon: coupon || undefined,
                }),
            });
            const order = await res.json();
            const rz = new window.Razorpay({
                key: order.key_id,
                amount: order.amount,
                currency: 'INR',
                order_id: order.order_id,
                handler: (r: {
                    razorpay_order_id: string;
                    razorpay_payment_id: string;
                    razorpay_signature: string;
                }) => {
                    router.post('/wallet/verify', {
                        ...r,
                        amount: parseFloat(amount),
                    });
                },
            });
            rz.open();
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <Head title="Wallet" />
            <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4">
                <Heading
                    title={`Wallet — ₹${balance.toFixed(2)}`}
                    description="Recharge once, chat/call/video per-minute. Min start balance = 5 minutes."
                />
                <Card>
                    <CardHeader>
                        <CardTitle>Recharge</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {['100', '500', '1000', '2000'].map((a) => (
                            <Button
                                key={a}
                                variant={amount === a ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setAmount(a)}
                            >
                                ₹{a}
                            </Button>
                        ))}
                        <Input
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            type="number"
                            min={10}
                            className="w-32"
                        />
                        <Input
                            value={coupon}
                            onChange={(e) => setCoupon(e.target.value)}
                            placeholder="Coupon (optional)"
                            className="w-40"
                        />
                        <Button onClick={recharge} disabled={busy}>
                            Recharge
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>History</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                        {transactions.data.map((t) => (
                            <div
                                key={t.id}
                                className="flex justify-between border-b py-1"
                            >
                                <span>
                                    {t.type} ·{' '}
                                    {new Date(t.created_at).toLocaleString()}
                                </span>
                                <span
                                    className={
                                        t.amount >= 0
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }
                                >
                                    {t.amount >= 0 ? '+' : ''}₹
                                    {t.amount.toFixed(2)}
                                </span>
                            </div>
                        ))}
                        {transactions.data.length === 0 && (
                            <p className="text-muted-foreground">
                                No transactions yet.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

WalletIndex.layout = { breadcrumbs };
