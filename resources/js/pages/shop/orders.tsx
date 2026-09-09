import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Orders', href: '/shop-orders' },
];

export default function ShopOrders({
    orders,
}: {
    orders: {
        data: Array<{
            id: number;
            status: string;
            total_paise: number;
            created_at: string;
        }>;
    };
}) {
    return (
        <>
            <Head title="Orders" />
            <div className="mx-auto max-w-xl space-y-3 p-4">
                <Heading title="My orders" />
                {orders.data.map((o) => (
                    <Card key={o.id}>
                        <CardContent className="flex justify-between py-3 text-sm">
                            <span>
                                #{o.id} · {o.status}
                            </span>
                            <span>₹{(o.total_paise / 100).toFixed(2)}</span>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}

ShopOrders.layout = { breadcrumbs };
