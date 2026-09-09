import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

type Props = {
    posts: {
        data: Array<{
            id: number;
            title: string;
            slug: string;
            status: string;
            published_at: string | null;
        }>;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Posts', href: '/admin/posts' },
];

export default function AdminPostsIndex({ posts }: Props) {
    return (
        <>
            <Head title="Manage posts" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Blog posts" />
                    <Button asChild size="sm">
                        <Link href="/admin/posts/create">New post</Link>
                    </Button>
                </div>
                <div className="space-y-2">
                    {posts.data.map((post) => (
                        <Card key={post.id}>
                            <CardContent className="flex items-center justify-between gap-3 py-3">
                                <div>
                                    <p className="font-medium">{post.title}</p>
                                    <p className="text-muted-foreground text-xs">
                                        {post.slug} ·{' '}
                                        {post.published_at ?? 'unpublished'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={
                                            post.status === 'published'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {post.status}
                                    </Badge>
                                    <Button size="sm" variant="outline" asChild>
                                        <Link
                                            href={`/admin/posts/${post.id}/edit`}
                                        >
                                            Edit
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

AdminPostsIndex.layout = { breadcrumbs };
