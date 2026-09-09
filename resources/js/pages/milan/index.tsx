import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kundli Milan', href: '/customer/milan' },
];

export default function MilanIndex({
    kundlis,
}: {
    kundlis: Array<{ id: number; profile_name: string }>;
}) {
    return (
        <>
            <Head title="Kundli Milan" />
            <div className="mx-auto max-w-xl space-y-4 p-4">
                <Heading
                    title="Kundli Milan (36 guna)"
                    description="Estimate + Manglik check. Confirm with astrologer."
                />
                <Card>
                    <CardContent className="py-4">
                        <Form
                            method="post"
                            action="/customer/milan"
                            className="space-y-3"
                        >
                            {() => (
                                <>
                                    <select
                                        name="a_id"
                                        className="h-10 w-full rounded border px-2 text-sm"
                                        required
                                    >
                                        {kundlis.map((k) => (
                                            <option key={k.id} value={k.id}>
                                                {k.profile_name}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        name="b_id"
                                        className="h-10 w-full rounded border px-2 text-sm"
                                        required
                                    >
                                        {kundlis.map((k) => (
                                            <option key={k.id} value={k.id}>
                                                {k.profile_name}
                                            </option>
                                        ))}
                                    </select>
                                    <Button type="submit">Match</Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

MilanIndex.layout = { breadcrumbs };
