import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Admin', href: '#' }];

export default function Disputes({
    disputes,
}: {
    disputes: { data: Array<{ id: number; subject: string; status: string }> };
}) {
    return (
        <>
            <Head title="Disputes" />
            <div className="space-y-2 p-4">
                <Heading title="Disputes" />
                {disputes.data.map((d) => (
                    <Card key={d.id}>
                        <CardContent className="py-2 text-sm">
                            <p>
                                #{d.id} {d.subject} — {d.status}
                            </p>
                            <Form
                                method="post"
                                action={`/admin/ops/disputes/${d.id}/resolve`}
                                className="mt-2 flex gap-2"
                            >
                                {() => (
                                    <>
                                        <Input
                                            name="resolution"
                                            placeholder="Resolution"
                                            required
                                        />
                                        <Button size="sm" type="submit">
                                            Resolve
                                        </Button>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
Disputes.layout = { breadcrumbs };
