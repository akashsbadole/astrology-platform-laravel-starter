import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Ops', href: '/admin/ops' }];

function Row({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">{children}</CardContent>
        </Card>
    );
}

export function OpsDashboard({ stats }: { stats: Record<string, number> }) {
    return (
        <>
            <Head title="Ops" />
            <div className="space-y-4 p-4">
                <Heading title="Ops dashboard" />
                <Row title="Money">
                    <p>
                        Gross ₹{stats.gross} · Commission ₹{stats.commission} ·
                        Orders {stats.orders}
                    </p>
                    <p>
                        Pending: payouts {stats.payouts_pending}, refunds{' '}
                        {stats.refunds_open}, disputes {stats.disputes_open},
                        tickets {stats.tickets_open}
                    </p>
                </Row>
            </div>
        </>
    );
}
OpsDashboard.layout = { breadcrumbs };

export function SimpleList({
    title,
    rows,
}: {
    title: string;
    rows: Array<Record<string, unknown>>;
}) {
    return (
        <>
            <Head title={title} />
            <div className="space-y-3 p-4">
                <Heading title={title} />
                {rows.map((r, i) => (
                    <Card key={i}>
                        <CardContent className="py-2 text-xs">
                            {JSON.stringify(r)}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
SimpleList.layout = { breadcrumbs };

export function CouponAdmin({
    coupons,
}: {
    coupons: {
        data: Array<{
            code: string;
            type: string;
            value_paise: number;
            is_active: boolean;
        }>;
    };
}) {
    return (
        <>
            <Head title="Coupons" />
            <div className="space-y-3 p-4">
                <Heading title="Coupons" />
                <Card>
                    <CardContent className="py-3">
                        <Form
                            method="post"
                            action="/admin/ops/coupons"
                            className="flex gap-2"
                        >
                            {() => (
                                <>
                                    <Input
                                        name="code"
                                        placeholder="DIWALI50"
                                        required
                                    />
                                    <Input
                                        name="value_paise"
                                        type="number"
                                        placeholder="value paise"
                                        required
                                    />
                                    <Input name="type" defaultValue="flat" />
                                    <Button size="sm" type="submit">
                                        Create
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
                {coupons.data.map((c) => (
                    <Card key={c.code}>
                        <CardContent className="py-2 text-sm">
                            {c.code} · {c.type} · {c.value_paise}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
CouponAdmin.layout = { breadcrumbs };
