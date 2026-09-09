import { Head, Link, router } from '@inertiajs/react';
import { Star } from 'lucide-react';
import { type FormEvent } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

type AstrologerRow = {
    id: number;
    user_id: number;
    name: string;
    specializations: string[];
    languages: string[];
    experience_years: number;
    rating_avg: number;
    rating_count: number;
    rate_chat_per_min: string | null;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

type Props = {
    astrologers: { data: AstrologerRow[]; links: PaginationLink[] };
    filters: {
        specialization: string | null;
        language: string | null;
        max_rate: string | null;
        sort: string;
    };
    specializationOptions: string[];
    languageOptions: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer/dashboard' },
    { title: 'Astrologers', href: '/customer/astrologers' },
];

export default function AstrologersIndex({
    astrologers,
    filters,
    specializationOptions,
    languageOptions,
}: Props) {
    const applyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const params = Object.fromEntries(
            Array.from(formData.entries()).filter(([, value]) => value !== ''),
        );
        router.get('/customer/astrologers', params, { preserveState: true });
    };

    return (
        <>
            <Head title="Find an astrologer" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading
                    title="Find an astrologer"
                    description="Filter by specialization, language, or budget"
                />

                <form
                    onSubmit={applyFilters}
                    className="flex flex-wrap items-end gap-3 rounded-lg border p-4"
                >
                    <div className="grid gap-1.5">
                        <label className="text-sm font-medium">
                            Specialization
                        </label>
                        <select
                            name="specialization"
                            defaultValue={filters.specialization ?? ''}
                            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                        >
                            <option value="">Any</option>
                            {specializationOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-1.5">
                        <label className="text-sm font-medium">Language</label>
                        <select
                            name="language"
                            defaultValue={filters.language ?? ''}
                            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                        >
                            <option value="">Any</option>
                            {languageOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-1.5">
                        <label className="text-sm font-medium">
                            Max chat rate (₹/min)
                        </label>
                        <input
                            type="number"
                            name="max_rate"
                            min={0}
                            defaultValue={filters.max_rate ?? ''}
                            className="border-input bg-background h-9 w-32 rounded-md border px-3 text-sm"
                        />
                    </div>

                    <div className="grid gap-1.5">
                        <label className="text-sm font-medium">Sort by</label>
                        <select
                            name="sort"
                            defaultValue={filters.sort}
                            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                        >
                            <option value="rating">Top rated</option>
                            <option value="price">Lowest price</option>
                            <option value="experience">Most experienced</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-4 text-sm font-medium"
                    >
                        Apply
                    </button>
                </form>

                {astrologers.data.length === 0 ? (
                    <Card>
                        <CardContent className="text-muted-foreground py-10 text-center text-sm">
                            No astrologers match those filters.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {astrologers.data.map((astrologer) => (
                            <Link
                                key={astrologer.id}
                                href={`/customer/astrologers/${astrologer.id}`}
                            >
                                <Card className="hover:border-primary/50 h-full transition-colors">
                                    <CardHeader>
                                        <div className="flex items-center justify-between gap-2">
                                            <CardTitle>
                                                {astrologer.name}
                                            </CardTitle>
                                            <div className="text-muted-foreground flex items-center gap-1 text-sm">
                                                <Star className="size-3.5 fill-current" />
                                                {astrologer.rating_avg.toFixed(
                                                    1,
                                                )}
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
                                        <p className="text-muted-foreground text-sm">
                                            {astrologer.experience_years} years
                                            experience
                                            {astrologer.rate_chat_per_min &&
                                                ` · ₹${astrologer.rate_chat_per_min}/min chat`}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                {astrologers.links.length > 3 && (
                    <div className="flex flex-wrap gap-1">
                        {astrologers.links.map((link) => (
                            <Link
                                key={link.label}
                                href={link.url ?? '#'}
                                preserveState
                                className={`rounded-md border px-3 py-1 text-sm ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'hover:bg-accent'
                                } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

AstrologersIndex.layout = { breadcrumbs };
