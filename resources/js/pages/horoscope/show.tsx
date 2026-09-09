import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Horoscope', href: '/horoscope' },
];

export default function HoroscopeShow({
    rashi,
    period,
    horoscope,
}: {
    rashi: string;
    period: string;
    horoscope: {
        title: string | null;
        body: string;
        lucky_color: string | null;
        lucky_number: string | null;
        lucky_time: string | null;
        date: string | null;
    } | null;
}) {
    return (
        <>
            <Head title={`${rashi} horoscope`} />
            <div className="mx-auto max-w-2xl space-y-4 p-4">
                <Heading title={`${rashi} — ${period}`} />
                <Card>
                    <CardContent className="py-4 text-sm whitespace-pre-wrap">
                        {horoscope?.body ?? 'Updating soon.'}
                    </CardContent>
                </Card>
                {horoscope && (
                    <p className="text-muted-foreground text-xs">
                        Lucky: {horoscope.lucky_color} ·{' '}
                        {horoscope.lucky_number} · {horoscope.lucky_time}
                    </p>
                )}
            </div>
        </>
    );
}

HoroscopeShow.layout = { breadcrumbs };
