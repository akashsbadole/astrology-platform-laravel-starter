import { Head } from '@inertiajs/react';
import { Star } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

type FeaturedAstrologer = {
    id: number;
    name: string;
    specializations: string[];
    rating_avg: number;
    rating_count: number;
    rate_chat_per_min: string | null;
};

type Props = {
    featuredAstrologers: FeaturedAstrologer[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer/dashboard' },
];

export default function CustomerDashboard({ featuredAstrologers }: Props) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading
                    title="Find an astrologer"
                    description="Top-rated astrologers available for chat, call, and video consultations"
                />

                {featuredAstrologers.length === 0 ? (
                    <Card>
                        <CardContent className="text-muted-foreground py-10 text-center text-sm">
                            No astrologers are available yet. Check back soon.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {featuredAstrologers.map((astrologer) => (
                            <Card key={astrologer.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between gap-2">
                                        <CardTitle>{astrologer.name}</CardTitle>
                                        <div className="text-muted-foreground flex items-center gap-1 text-sm">
                                            <Star className="size-3.5 fill-current" />
                                            {astrologer.rating_avg.toFixed(1)}
                                            <span className="text-xs">
                                                ({astrologer.rating_count})
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        {astrologer.specializations.map(
                                            (specialization) => (
                                                <Badge
                                                    key={specialization}
                                                    variant="secondary"
                                                >
                                                    {specialization}
                                                </Badge>
                                            ),
                                        )}
                                    </div>
                                    {astrologer.rate_chat_per_min && (
                                        <p className="text-muted-foreground text-sm">
                                            From ₹{astrologer.rate_chat_per_min}
                                            /min chat
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

CustomerDashboard.layout = { breadcrumbs };
