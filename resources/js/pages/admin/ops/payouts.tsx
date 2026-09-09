import { Head, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Payouts', href: '/admin/ops/payouts' },
];

export default function Payouts({
    payouts,
}: {
    payouts: {
        data: Array<{
            id: number;
            astrologer_id: number;
            amount_paise: number;
            status: string;
        }>;
    };
}) {
    return (
        <>
            <Head title="Payouts" />
            <div className="space-y-3 p-4">
                <Heading title="Payouts" />
                {payouts.data.map((p) => (
                    <Card key={p.id}>
                        <CardContent className="flex justify-between py-2 text-sm">
                            <span>
                                #{p.id} astro {p.astrologer_id} ₹
                                {(p.amount_paise / 100).toFixed(2)} · {p.status}
                            </span>
                            <Button
                                size="sm"
                                onClick={() =>
                                    router.post(
                                        `/admin/ops/payouts/${p.id}/approve`,
                                    )
                                }
                            >
                                Mark paid
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
Payouts.layout = { breadcrumbs };
