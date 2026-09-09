import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Astrologers', href: '/astrologers' },
];

type Row = {
    id: number;
    user_id: number;
    name: string;
    specializations: string[];
    experience_years: number;
    rating_avg: number;
    rate_chat_per_min: string | null;
    rate_call_per_min: string | null;
    is_online: boolean;
    is_first_free: boolean;
};

export default function PublicAstrologers({
    astrologers,
}: {
    astrologers: { data: Row[] };
}) {
    return (
        <>
            <Head title="Talk to astrologers" />
            <div className="mx-auto max-w-4xl space-y-4 p-4">
                <Heading
                    title="Talk to astrologers"
                    description="Chat / Call per-minute · wallet billing · first chat free on select profiles"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                    {astrologers.data.map((a) => (
                        <Card key={a.id}>
                            <CardContent className="space-y-2 py-4">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`size-2 rounded-full ${a.is_online ? 'bg-green-500' : 'bg-gray-400'}`}
                                    />
                                    <p className="font-medium">{a.name}</p>
                                    {a.is_first_free && (
                                        <Badge>First free</Badge>
                                    )}
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    {a.experience_years}y · ★
                                    {a.rating_avg.toFixed(1)} · ₹
                                    {a.rate_chat_per_min}/min
                                </p>
                                <Link
                                    className="text-primary text-sm underline"
                                    href={`/customer/astrologers/${a.id}`}
                                >
                                    Chat Now / Call Now
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

PublicAstrologers.layout = { breadcrumbs };
