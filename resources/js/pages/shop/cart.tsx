import { Head, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Cart', href: '/shop/cart' }];

export default function ShopCart({
    items,
    total,
}: {
    items: Array<{ id: number; name: string; price: number; qty: number }>;
    total: number;
}) {
    return (
        <>
            <Head title="Cart" />
            <div className="mx-auto max-w-xl space-y-4 p-4">
                <Heading title={`Cart — ₹${total.toFixed(2)}`} />
                {items.map((i) => (
                    <Card key={i.id}>
                        <CardContent className="flex justify-between py-3 text-sm">
                            <span>
                                {i.name} × {i.qty}
                            </span>
                            <span>₹{(i.price * i.qty).toFixed(2)}</span>
                        </CardContent>
                    </Card>
                ))}
                {items.length > 0 && (
                    <Button onClick={() => router.post('/shop/checkout')}>
                        Checkout (wallet first, else Razorpay)
                    </Button>
                )}
            </div>
        </>
    );
}

ShopCart.layout = { breadcrumbs };
