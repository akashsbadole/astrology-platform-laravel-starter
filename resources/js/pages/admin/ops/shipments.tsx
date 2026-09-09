import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Shipments', href: '#' }];

const STATUSES = [
    'pending',
    'packed',
    'shipped',
    'in_transit',
    'delivered',
    'cancelled',
];

export default function Shipments({
    orders,
}: {
    orders: {
        data: Array<{
            id: number;
            customer: string;
            status: string;
            shipping_status: string;
            tracking_number: string | null;
            carrier: string | null;
            total: number;
        }>;
    };
}) {
    return (
        <>
            <Head title="Shipments" />
            <div className="space-y-3 p-4">
                <Heading
                    title="Shipments"
                    description="Update status + tracking. Customer gets mail + push."
                />
                {orders.data.map((o) => (
                    <Card key={o.id}>
                        <CardContent className="space-y-2 py-3 text-sm">
                            <p>
                                Order #{o.id} · {o.customer} · ₹
                                {o.total.toFixed(2)} · pay:{o.status} · ship:
                                {o.shipping_status}
                                {o.tracking_number
                                    ? ` · ${o.tracking_number}`
                                    : ''}
                            </p>
                            <Form
                                method="post"
                                action={`/admin/ops/shipments/${o.id}`}
                                className="flex flex-wrap gap-2"
                            >
                                {() => (
                                    <>
                                        <select
                                            name="shipping_status"
                                            defaultValue={o.shipping_status}
                                            className="h-9 rounded border px-2 text-sm"
                                        >
                                            {STATUSES.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                        <Input
                                            name="carrier"
                                            defaultValue={o.carrier ?? ''}
                                            placeholder="Carrier"
                                            className="w-32"
                                        />
                                        <Input
                                            name="tracking_number"
                                            defaultValue={
                                                o.tracking_number ?? ''
                                            }
                                            placeholder="Tracking #"
                                            className="w-44"
                                        />
                                        <Input
                                            name="note"
                                            placeholder="Note (optional)"
                                            className="w-44"
                                        />
                                        <Button size="sm" type="submit">
                                            Update + notify
                                        </Button>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}

Shipments.layout = { breadcrumbs };
