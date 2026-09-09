import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

type Props = {
    consultations: {
        data: Array<{
            id: number;
            type: string;
            status: string;
            end_reason: string | null;
            missed_by: string | null;
            rate_per_min: string;
            billed_minutes: number;
            amount: string;
            created_at: string;
        }>;
    };
    balance: number;
    missedCount: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Consultations', href: '/consultations' },
];

export default function ConsultIndex({
    consultations,
    balance,
    missedCount,
}: Props) {
    return (
        <>
            <Head title="My consultations" />
            <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
                <Heading
                    title="Consultations"
                    description={`Wallet ₹${Number(balance).toFixed(2)} — per-minute billing${missedCount > 0 ? ` · ${missedCount} missed (no charge)` : ''}`}
                />
                {consultations.data.map((c) => (
                    <Card key={c.id}>
                        <CardContent className="flex items-center justify-between py-3">
                            <div>
                                <p className="font-medium">
                                    #{c.id} · {c.type} · ₹{c.rate_per_min}/min
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    {c.billed_minutes} min · ₹{c.amount} ·{' '}
                                    {new Date(c.created_at).toLocaleString()}
                                    {c.end_reason === 'missed'
                                        ? ` · missed by ${c.missed_by ?? 'astrologer'} (no charge)`
                                        : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={
                                        c.end_reason === 'missed'
                                            ? 'destructive'
                                            : undefined
                                    }
                                >
                                    {c.end_reason === 'missed'
                                        ? 'missed'
                                        : c.status}
                                </Badge>
                                {(c.status === 'queued' ||
                                    c.status === 'active') && (
                                    <Link
                                        className="text-primary text-sm underline"
                                        href={`/consult/${c.id}`}
                                    >
                                        Join
                                    </Link>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {consultations.data.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                        No consultations yet. Pick an astrologer and Chat Now.
                    </p>
                )}
            </div>
        </>
    );
}

ConsultIndex.layout = { breadcrumbs };
