import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

type PostRow = {
    id: number;
    slug: string;
    title: string;
    excerpt: string | null;
    published_at: string | null;
    author_name: string;
};

type Props = { posts: { data: PostRow[] } };

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Blog', href: '/blog' }];

export default function BlogIndex({ posts }: Props) {
    return (
        <>
            <Head title="Blog" />
            <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading
                    title="Blog & Articles"
                    description="Vedic wisdom, remedies and guides"
                />
                {posts.data.length === 0 ? (
                    <Card>
                        <CardContent className="text-muted-foreground py-10 text-center text-sm">
                            No articles yet. Check back soon.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {posts.data.map((post) => (
                            <Card key={post.id}>
                                <CardContent className="space-y-1 py-4">
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="text-lg font-medium hover:underline"
                                    >
                                        {post.title}
                                    </Link>
                                    {post.excerpt && (
                                        <p className="text-muted-foreground text-sm">
                                            {post.excerpt}
                                        </p>
                                    )}
                                    <p className="text-muted-foreground text-xs">
                                        {post.author_name} · {post.published_at}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

BlogIndex.layout = { breadcrumbs };
