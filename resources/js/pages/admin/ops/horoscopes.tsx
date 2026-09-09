import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Horoscopes', href: '#' }];

export default function Horoscopes({
    items,
}: {
    items: {
        data: Array<{
            id: number;
            rashi: string;
            period: string;
            date: string | null;
            title: string | null;
        }>;
    };
}) {
    return (
        <>
            <Head title="Horoscopes" />
            <div className="space-y-3 p-4">
                <Heading title="Horoscopes" />
                <Card>
                    <CardContent className="py-3">
                        <Form
                            method="post"
                            action="/admin/ops/horoscopes"
                            className="grid gap-2"
                        >
                            {() => (
                                <>
                                    <div className="flex gap-2">
                                        <Input
                                            name="rashi"
                                            placeholder="Mesha"
                                            required
                                        />
                                        <Input
                                            name="period"
                                            defaultValue="daily"
                                        />
                                        <Input name="date" type="date" />
                                    </div>
                                    <Input name="title" placeholder="Title" />
                                    <textarea
                                        name="body"
                                        required
                                        rows={3}
                                        placeholder="Prediction…"
                                        className="rounded border px-2 py-1 text-sm"
                                    />
                                    <Button
                                        size="sm"
                                        type="submit"
                                        className="w-fit"
                                    >
                                        Save
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
                {items.data.map((h) => (
                    <Card key={h.id}>
                        <CardContent className="py-2 text-sm">
                            {h.rashi} · {h.period} · {h.date} · {h.title}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
Horoscopes.layout = { breadcrumbs };
