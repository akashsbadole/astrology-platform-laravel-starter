import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Order', href: '/shop-orders' },
];

const STEPS = ['pending', 'packed', 'shipped', 'in_transit', 'delivered'];

export default function OrderShow({
    order,
    items,
    timeline,
}: {
    order: {
        id: number;
        status: string;
        total: number;
        shipping_status: string;
        tracking_number: string | null;
        carrier: string | null;
        shipped_at: string | null;
        delivered_at: string | null;
        created_at: string;
    };
    items: Array<{ id: number; qty: number; price: number; name: string }>;
    timeline: Array<{
        id: number;
        status: string;
        carrier: string | null;
        tracking_number: string | null;
        note: string | null;
        created_at: string;
    }>;
}) {
    const stepIdx = Math.max(0, STEPS.indexOf(order.shipping_status));

    return (
        <>
            <Head title={`Order #${order.id}`} />
            <div className="mx-auto max-w-xl space-y-4 p-4">
                <Heading
                    title={`Order #${order.id} — ${order.shipping_status}`}
                    description={`Placed ${new Date(order.created_at).toLocaleString()} · ₹${order.total.toFixed(2)}`}
                />
                {order.tracking_number && (
                    <p className="text-sm">
                        Tracking:{' '}
                        <span className="font-medium">
                            {order.tracking_number}
                        </span>
                        {order.carrier ? ` via ${order.carrier}` : ''}
                    </p>
                )}
                <div className="flex items-center gap-1">
                    {STEPS.map((s, i) => (
                        <div key={s} className="flex flex-1 items-center gap-1">
                            <div
                                className={`h-2 flex-1 rounded ${i <= stepIdx ? 'bg-primary' : 'bg-muted'}`}
                            />
                        </div>
                    ))}
                </div>
                <p className="text-muted-foreground text-xs capitalize">
                    {STEPS.slice(0, stepIdx + 1).join(' → ')}
                </p>
                <Card>
                    <CardContent className="space-y-1 py-3 text-sm">
                        {items.map((i) => (
                            <div key={i.id} className="flex justify-between">
                                <span>
                                    {i.name} × {i.qty}
                                </span>
                                <span>₹{(i.price * i.qty).toFixed(2)}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="space-y-1 py-3 text-xs">
                        <p className="font-medium">Tracking timeline</p>
                        {timeline.map((t) => (
                            <p key={t.id} className="text-muted-foreground">
                                {new Date(t.created_at).toLocaleString()} ·{' '}
                                {t.status}
                                {t.tracking_number
                                    ? ` · ${t.tracking_number}`
                                    : ''}
                                {t.note ? ` — ${t.note}` : ''}
                            </p>
                        ))}
                        {timeline.length === 0 && (
                            <p className="text-muted-foreground">
                                Packed soon. We notify on every status change.
                            </p>
                        )}
                    </CardContent>
                </Card>
                <Link href="/shop-orders" className="text-sm underline">
                    Back to orders
                </Link>
            </div>
        </>
    );
}

OrderShow.layout = { breadcrumbs };
