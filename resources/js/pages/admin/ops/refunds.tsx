import { Head, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Refunds', href: '#' }];

export default function Refunds({
    refunds,
}: {
    refunds: {
        data: Array<{
            id: number;
            user_id: number;
            amount_paise: number;
            status: string;
            reason: string | null;
        }>;
    };
}) {
    return (
        <>
            <Head title="Refunds" />
            <div className="space-y-2 p-4">
                <Heading title="Refunds → wallet credit" />
                {refunds.data.map((r) => (
                    <Card key={r.id}>
                        <CardContent className="flex justify-between py-2 text-sm">
                            <span>
                                #{r.id} user {r.user_id} ₹
                                {(r.amount_paise / 100).toFixed(2)} · {r.status}
                            </span>
                            <Button
                                size="sm"
                                onClick={() =>
                                    router.post(
                                        `/admin/ops/refunds/${r.id}/process`,
                                    )
                                }
                            >
                                Credit wallet
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
Refunds.layout = { breadcrumbs };
