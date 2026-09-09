import { Form, Head, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Live admin', href: '#' }];

export default function LiveAdmin({
    sessions,
}: {
    sessions: { data: Array<{ id: number; title: string; status: string }> };
}) {
    return (
        <>
            <Head title="Live" />
            <div className="space-y-3 p-4">
                <Heading title="Live sessions" />
                <Card>
                    <CardContent className="py-3">
                        <Form
                            method="post"
                            action="/admin/ops/live"
                            className="flex gap-2"
                        >
                            {() => (
                                <>
                                    <Input
                                        name="astrologer_id"
                                        type="number"
                                        placeholder="astrologer user id"
                                        required
                                    />
                                    <Input
                                        name="title"
                                        placeholder="Title"
                                        required
                                    />
                                    <Button size="sm" type="submit">
                                        Schedule
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
                {sessions.data.map((s) => (
                    <Card key={s.id}>
                        <CardContent className="flex justify-between py-2 text-sm">
                            <span>
                                {s.title} · {s.status}
                            </span>
                            <Button
                                size="sm"
                                onClick={() =>
                                    router.post(
                                        `/admin/ops/live/${s.id}/toggle`,
                                    )
                                }
                            >
                                Go live / End
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
LiveAdmin.layout = { breadcrumbs };
