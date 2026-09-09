import { Form, Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { BreadcrumbItem } from '@/types';

type PostForm = {
    id?: number;
    title: string;
    excerpt: string | null;
    body: string;
    status: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Posts', href: '/admin/posts' },
    { title: 'Editor', href: '#' },
];

export default function AdminPostForm({ post }: { post: PostForm | null }) {
    const isEdit = !!post;
    return (
        <>
            <Head title={isEdit ? 'Edit post' : 'New post'} />
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading title={isEdit ? 'Edit post' : 'New post'} />
                <Card>
                    <CardContent className="py-6">
                        <Form
                            method={isEdit ? 'put' : 'post'}
                            action={
                                isEdit
                                    ? `/admin/posts/${post.id}`
                                    : '/admin/posts'
                            }
                            className="grid gap-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            defaultValue={post?.title ?? ''}
                                            required
                                        />
                                        <InputError message={errors.title} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="excerpt">Excerpt</Label>
                                        <Input
                                            id="excerpt"
                                            name="excerpt"
                                            defaultValue={post?.excerpt ?? ''}
                                        />
                                        <InputError message={errors.excerpt} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="body">Body</Label>
                                        <textarea
                                            id="body"
                                            name="body"
                                            defaultValue={post?.body ?? ''}
                                            required
                                            rows={12}
                                            className="border-input bg-background min-h-40 rounded-md border px-3 py-2 text-sm"
                                        />
                                        <InputError message={errors.body} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">Status</Label>
                                        <select
                                            id="status"
                                            name="status"
                                            defaultValue={
                                                post?.status ?? 'draft'
                                            }
                                            className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">
                                                Published
                                            </option>
                                        </select>
                                        <InputError message={errors.status} />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing && <Spinner />}
                                            {isEdit ? 'Update' : 'Create'}
                                        </Button>
                                        <Button variant="outline" asChild>
                                            <Link href="/admin/posts">
                                                Cancel
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminPostForm.layout = { breadcrumbs };
