import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Banners', href: '#' }];

export default function Banners({
    banners,
}: {
    banners: Array<{ id: number; title: string | null; slot: string }>;
}) {
    return (
        <>
            <Head title="Banners" />
            <div className="space-y-3 p-4">
                <Heading title="Banners / offers strip" />
                <Card>
                    <CardContent className="py-3">
                        <Form
                            method="post"
                            action="/admin/ops/banners"
                            className="flex gap-2"
                        >
                            {() => (
                                <>
                                    <Input
                                        name="title"
                                        placeholder="Diwali 50% off"
                                    />
                                    <Input name="link" placeholder="/wallet" />
                                    <Button size="sm" type="submit">
                                        Add
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
                {banners.map((b) => (
                    <Card key={b.id}>
                        <CardContent className="py-2 text-sm">
                            {b.title} · {b.slot}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
Banners.layout = { breadcrumbs };
