import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Live', href: '/live' }];

export default function LiveIndex({
    live,
    upcoming,
}: {
    live: Array<{ id: number; title: string; astrologer: { name: string } }>;
    upcoming: Array<{ id: number; title: string }>;
}) {
    return (
        <>
            <Head title="Live" />
            <div className="mx-auto max-w-2xl space-y-4 p-4">
                <Heading
                    title="Live sessions"
                    description="Join, ask, send gifts (wallet)"
                />
                {live.map((s) => (
                    <Card key={s.id}>
                        <CardContent className="py-3">
                            <Link
                                className="font-medium underline"
                                href={`/live/${s.id}`}
                            >
                                🔴 {s.title} — {s.astrologer.name}
                            </Link>
                        </CardContent>
                    </Card>
                ))}
                {live.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                        No one live now.
                    </p>
                )}
                <Heading title="Upcoming" />
                {upcoming.map((s) => (
                    <Card key={s.id}>
                        <CardContent className="py-3 text-sm">
                            <Link className="underline" href={`/live/${s.id}`}>
                                {s.title}
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}

LiveIndex.layout = { breadcrumbs };
