import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

type Props = {
    stats: {
        total_users: number;
        total_customers: number;
        total_astrologers: number;
        pending_astrologers: number;
        approved_astrologers: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
];

export default function AdminDashboard({ stats }: Props) {
    return (
        <>
            <Head title="Admin dashboard" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        title="Admin dashboard"
                        description="Platform overview"
                    />
                    {stats.pending_astrologers > 0 && (
                        <Button asChild>
                            <Link href="/admin/astrologers?status=pending">
                                Review {stats.pending_astrologers} pending
                                astrologer
                                {stats.pending_astrologers === 1 ? '' : 's'}
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-muted-foreground text-sm font-normal">
                                Total users
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                            {stats.total_users}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-muted-foreground text-sm font-normal">
                                Customers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                            {stats.total_customers}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-muted-foreground text-sm font-normal">
                                Astrologers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                            {stats.total_astrologers}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-muted-foreground text-sm font-normal">
                                Pending approval
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                            {stats.pending_astrologers}
                        </CardContent>
                    </Card>
                </div>

                <Link
                    href="/admin/astrologers"
                    className="text-primary text-sm underline-offset-4 hover:underline"
                >
                    View all astrologers →
                </Link>
            </div>
        </>
    );
}

AdminDashboard.layout = { breadcrumbs };
