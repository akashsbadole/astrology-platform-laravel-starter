import { Form, Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type ThreadRow = {
    id: number;
    title: string;
    author_name: string;
    category_name: string | null;
    is_pinned: boolean;
    is_locked: boolean;
    replies_count: number;
    last_reply_at: string | null;
    created_at: string;
};

type Props = {
    categories: Array<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        threads_count: number;
    }>;
    threads: { data: ThreadRow[] };
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Forum', href: '/forum' }];

export default function ForumIndex({ categories, threads }: Props) {
    return (
        <>
            <Head title="Community forum" />
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading
                    title="Community forum"
                    description="Ask, share and learn together"
                />

                <div className="grid gap-2 sm:grid-cols-3">
                    {categories.map((c) => (
                        <Card key={c.id}>
                            <CardContent className="py-4">
                                <Link
                                    href={`/forum/category/${c.slug}`}
                                    className="font-medium hover:underline"
                                >
                                    {c.name}
                                </Link>
                                <p className="text-muted-foreground text-xs">
                                    {c.threads_count} threads
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="space-y-2">
                    {threads.data.map((t) => (
                        <Card key={t.id}>
                            <CardContent className="flex items-center justify-between gap-3 py-3">
                                <div>
                                    <Link
                                        href={`/forum/threads/${t.id}`}
                                        className="font-medium hover:underline"
                                    >
                                        {t.is_pinned ? '📌 ' : ''}
                                        {t.title}
                                    </Link>
                                    <p className="text-muted-foreground text-xs">
                                        {t.author_name} · {t.category_name} ·{' '}
                                        {t.replies_count} replies
                                        {t.is_locked ? ' · locked' : ''}
                                    </p>
                                </div>
                                <Badge
                                    variant={
                                        t.is_locked
                                            ? 'destructive'
                                            : 'secondary'
                                    }
                                >
                                    {t.is_locked
                                        ? 'Locked'
                                        : `${t.replies_count} replies`}
                                </Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardContent className="py-4">
                        <Form
                            method="post"
                            action="/forum/threads"
                            className="grid gap-3"
                        >
                            {() => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">
                                            Start a new discussion
                                        </Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            placeholder="Thread title"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category_id">
                                            Category
                                        </Label>
                                        <select
                                            id="category_id"
                                            name="category_id"
                                            className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                                            required
                                        >
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <textarea
                                        name="body"
                                        required
                                        rows={4}
                                        placeholder="Share details..."
                                        className="border-input bg-background rounded-md border px-3 py-2 text-sm"
                                    />
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="w-fit"
                                    >
                                        Post thread
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ForumIndex.layout = { breadcrumbs };
