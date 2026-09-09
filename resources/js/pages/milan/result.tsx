import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Milan result', href: '/customer/milan' },
];

export default function MilanResult({
    a,
    b,
    result,
}: {
    a: { name: string };
    b: { name: string };
    result: {
        score: number;
        max: number;
        percent: number;
        breakdown: Array<{ name: string; score: number; max: number }>;
        verdict: string;
        note: string;
    };
}) {
    return (
        <>
            <Head title="Milan result" />
            <div className="mx-auto max-w-xl space-y-4 p-4">
                <Heading
                    title={`${a.name} × ${b.name}: ${result.score}/${result.max} (${result.percent}%)`}
                    description={result.verdict}
                />
                <Card>
                    <CardContent className="space-y-1 py-4 text-sm">
                        {result.breakdown.map((g) => (
                            <div key={g.name} className="flex justify-between">
                                <span>{g.name}</span>
                                <span>
                                    {g.score}/{g.max}
                                </span>
                            </div>
                        ))}
                        <p className="text-muted-foreground pt-2 text-xs">
                            {result.note}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

MilanResult.layout = { breadcrumbs };
