import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AstrologerProfileStatus, BreadcrumbItem } from '@/types';

type AstrologerRow = {
    id: number;
    name: string;
    email: string;
    status: AstrologerProfileStatus;
    experience_years: number;
    specializations: string[];
    created_at: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    total: number;
};

type Props = {
    astrologers: Paginated<AstrologerRow>;
    filters: { status: string | null };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Astrologers', href: '/admin/astrologers' },
];

const STATUS_FILTERS: { label: string; value: string | null }[] = [
    { label: 'All', value: null },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
];

const statusVariant: Record<
    AstrologerProfileStatus,
    'default' | 'secondary' | 'destructive'
> = {
    approved: 'default',
    pending: 'secondary',
    rejected: 'destructive',
};

export default function AdminAstrologersIndex({ astrologers, filters }: Props) {
    const approve = (id: number) => {
        router.patch(
            `/admin/astrologers/${id}/approve`,
            {},
            { preserveScroll: true },
        );
    };

    const reject = (id: number) => {
        const reason = window.prompt(
            'Reason for rejecting this astrologer profile:',
        );

        if (!reason) {
            return;
        }

        router.patch(
            `/admin/astrologers/${id}/reject`,
            { rejection_reason: reason },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Astrologers" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading
                    title="Astrologers"
                    description="Review and moderate astrologer profiles"
                />

                <div className="flex gap-2">
                    {STATUS_FILTERS.map((filter) => (
                        <Link
                            key={filter.label}
                            href={
                                filter.value
                                    ? `/admin/astrologers?status=${filter.value}`
                                    : '/admin/astrologers'
                            }
                            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                                filters.status === filter.value
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'hover:bg-accent'
                            }`}
                        >
                            {filter.label}
                        </Link>
                    ))}
                </div>

                <div className="overflow-hidden rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-muted-foreground text-left">
                            <tr>
                                <th className="px-4 py-2.5 font-medium">
                                    Name
                                </th>
                                <th className="px-4 py-2.5 font-medium">
                                    Specializations
                                </th>
                                <th className="px-4 py-2.5 font-medium">
                                    Experience
                                </th>
                                <th className="px-4 py-2.5 font-medium">
                                    Status
                                </th>
                                <th className="px-4 py-2.5 font-medium">
                                    Applied
                                </th>
                                <th className="px-4 py-2.5 font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {astrologers.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-muted-foreground px-4 py-8 text-center"
                                    >
                                        No astrologers found.
                                    </td>
                                </tr>
                            )}
                            {astrologers.data.map((astrologer) => (
                                <tr key={astrologer.id}>
                                    <td className="px-4 py-2.5">
                                        <div className="font-medium">
                                            {astrologer.name}
                                        </div>
                                        <div className="text-muted-foreground text-xs">
                                            {astrologer.email}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex flex-wrap gap-1">
                                            {astrologer.specializations.map(
                                                (specialization) => (
                                                    <Badge
                                                        key={specialization}
                                                        variant="outline"
                                                    >
                                                        {specialization}
                                                    </Badge>
                                                ),
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {astrologer.experience_years} yrs
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <Badge
                                            variant={
                                                statusVariant[astrologer.status]
                                            }
                                            className="capitalize"
                                        >
                                            {astrologer.status}
                                        </Badge>
                                    </td>
                                    <td className="text-muted-foreground px-4 py-2.5">
                                        {astrologer.created_at}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {astrologer.status !== 'approved' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="mr-2"
                                                onClick={() =>
                                                    approve(astrologer.id)
                                                }
                                            >
                                                Approve
                                            </Button>
                                        )}
                                        {astrologer.status !== 'rejected' && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    reject(astrologer.id)
                                                }
                                            >
                                                Reject
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {astrologers.links.length > 3 && (
                    <div className="flex flex-wrap gap-1">
                        {astrologers.links.map((link) => (
                            <Link
                                key={link.label}
                                href={link.url ?? '#'}
                                className={`rounded-md border px-3 py-1 text-sm ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'hover:bg-accent'
                                } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

AdminAstrologersIndex.layout = { breadcrumbs };
