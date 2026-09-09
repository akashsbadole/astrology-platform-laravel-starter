import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

type Props = {
    category: { id: number; name: string; description: string | null };
    threads: {
        data: Array<{
            id: number;
            title: string;
            author_name: string;
            replies_count: number;
            is_locked: boolean;
            is_pinned: boolean;
        }>;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Forum', href: '/forum' },
    { title: 'Category', href: '#' },
];

export default function ForumCategoryShow({ category, threads }: Props) {
    return (
        <>
            <Head title={category.name} />
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading
                    title={category.name}
                    description={category.description ?? ''}
                />
                <div className="space-y-2">
                    {threads.data.map((t) => (
                        <Card key={t.id}>
                            <CardContent className="flex items-center justify-between gap-3 py-3">
                                <Link
                                    href={`/forum/threads/${t.id}`}
                                    className="font-medium hover:underline"
                                >
                                    {t.title}
                                </Link>
                                <Badge variant="secondary">
                                    {t.replies_count} replies
                                </Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

ForumCategoryShow.layout = { breadcrumbs };
