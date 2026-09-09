import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';

type Props = {
    post: {
        title: string;
        excerpt: string | null;
        body: string;
        published_at: string | null;
        author_name: string;
    };
};

export default function BlogShow({ post }: Props) {
    return (
        <>
            <Head title={post.title} />
            <div className="mx-auto max-w-3xl space-y-6 rounded-xl p-4">
                <Heading
                    title={post.title}
                    description={`${post.author_name} · ${post.published_at ?? ''}`}
                />
                <Card>
                    <CardContent className="prose dark:prose-invert max-w-none py-6 text-sm whitespace-pre-wrap">
                        {post.body}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

BlogShow.layout = { breadcrumbs: [{ title: 'Blog', href: '/blog' }] };
