import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

type Thread = {
    id: number;
    title: string;
    body: string;
    author_name: string;
    is_pinned: boolean;
    is_locked: boolean;
    replies_count: number;
};

type Props = {
    thread: Thread;
    posts: {
        data: Array<{
            id: number;
            body: string;
            author?: { name: string };
            created_at: string;
        }>;
    };
    canReply: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Forum', href: '/forum' },
    { title: 'Thread', href: '#' },
];

export default function ForumThreadShow({ thread, posts, canReply }: Props) {
    const { auth } = usePage<{ auth: { user: { role: string } } }>().props;
    const isAdmin = auth.user.role === 'admin';

    const moderate = (action: string) => {
        router.post(
            `/forum/threads/${thread.id}/moderate`,
            { action },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={thread.title} />
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading
                    title={thread.title}
                    description={`by ${thread.author_name}`}
                />
                <div className="flex gap-2">
                    {thread.is_pinned && <Badge>Pinned</Badge>}
                    {thread.is_locked && (
                        <Badge variant="destructive">Locked</Badge>
                    )}
                    {isAdmin && (
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    moderate(thread.is_pinned ? 'unpin' : 'pin')
                                }
                            >
                                {thread.is_pinned ? 'Unpin' : 'Pin'}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    moderate(
                                        thread.is_locked ? 'unlock' : 'lock',
                                    )
                                }
                            >
                                {thread.is_locked ? 'Unlock' : 'Lock'}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    if (window.confirm('Delete thread?'))
                                        moderate('delete');
                                }}
                            >
                                Delete
                            </Button>
                        </>
                    )}
                </div>

                <Card>
                    <CardContent className="py-4 text-sm whitespace-pre-wrap">
                        {thread.body}
                    </CardContent>
                </Card>

                <div className="space-y-2">
                    {posts.data.map((p) => (
                        <Card key={p.id}>
                            <CardContent className="py-3 text-sm">
                                <p className="whitespace-pre-wrap">{p.body}</p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    {(p.author as unknown as { name?: string })
                                        ?.name ?? 'Member'}{' '}
                                    · {new Date(p.created_at).toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {canReply ? (
                    <Card>
                        <CardContent className="py-4">
                            <Form
                                method="post"
                                action={`/forum/threads/${thread.id}/replies`}
                                className="flex gap-2"
                            >
                                {() => (
                                    <>
                                        <input
                                            name="body"
                                            required
                                            placeholder="Write a reply..."
                                            className="border-input bg-background h-10 flex-1 rounded-md border px-3 text-sm"
                                        />
                                        <Button type="submit" size="sm">
                                            Reply
                                        </Button>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                ) : (
                    <p className="text-muted-foreground text-center text-sm">
                        This thread is locked.
                    </p>
                )}

                <Link
                    href="/forum"
                    className="text-primary text-sm underline underline-offset-4"
                >
                    Back to forum
                </Link>
            </div>
        </>
    );
}

ForumThreadShow.layout = { breadcrumbs };
