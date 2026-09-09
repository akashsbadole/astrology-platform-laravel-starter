import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Horoscope', href: '/horoscope' },
];

export default function HoroscopeIndex({
    period,
    date,
    items,
}: {
    rashis: string[];
    period: string;
    date: string;
    items: Array<{ rashi: string; title: string | null; body: string }>;
}) {
    return (
        <>
            <Head title="Horoscope" />
            <div className="mx-auto max-w-4xl space-y-4 p-4">
                <Heading title={`Horoscope — ${period} · ${date}`} />
                <div className="flex gap-2 text-sm">
                    {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                        <Link
                            key={p}
                            href={`/horoscope?period=${p}`}
                            className={`underline ${p === period ? 'font-bold' : ''}`}
                        >
                            {p}
                        </Link>
                    ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    {items.map((i) => (
                        <Card key={i.rashi}>
                            <CardContent className="py-3">
                                <Link
                                    href={`/horoscope/${i.rashi}?period=${period}`}
                                    className="font-medium underline"
                                >
                                    {i.rashi}
                                </Link>
                                <p className="text-muted-foreground line-clamp-3 text-sm">
                                    {i.body}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

HoroscopeIndex.layout = { breadcrumbs };
