import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

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
    return (
        <>
            <Head title="Checkout" />
            <div className="mx-auto max-w-md space-y-4 p-4">
                <Heading
                    title={`Pay ₹${order.total}`}
                    description="Wallet failed — pay via Razorpay, then order is marked paid on webhook/verify."
                />
                <Card>
                    <CardContent className="py-4 text-sm">
                        Order #{order.id} · Razorpay order {razorpayOrder.id} ·
                        key {razorpayKeyId ? 'configured' : 'missing'}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
ShopCheckout.layout = { breadcrumbs };
