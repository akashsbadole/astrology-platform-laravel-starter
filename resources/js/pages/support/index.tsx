import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Support', href: '/support' }];

export default function SupportIndex({
    tickets,
    disputes: _disputes,
}: {
    tickets: { data: Array<{ id: number; subject: string; status: string }> };
    disputes: { data: Array<{ id: number; subject: string; status: string }> };
}) {
    return (
        <>
            <Head title="Support" />
            <div className="mx-auto max-w-xl space-y-4 p-4">
                <Heading
                    title="Help & disputes"
                    description="Tickets, refunds, disputes"
                />
                <Card>
                    <CardHeader>
                        <CardTitle>New ticket</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            method="post"
                            action="/support/tickets"
                            className="flex gap-2"
                        >
                            {() => (
                                <>
                                    <Input
                                        name="subject"
                                        placeholder="Subject"
                                        required
                                    />
                                    <Button type="submit" size="sm">
                                        Raise
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Request refund (wallet credit)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            method="post"
                            action="/support/refunds"
                            className="flex gap-2"
                        >
                            {() => (
                                <>
                                    <Input
                                        name="amount"
                                        type="number"
                                        placeholder="₹"
                                        required
                                    />
                                    <Button type="submit" size="sm">
                                        Request
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
                {tickets.data.map((t) => (
                    <p key={t.id} className="text-sm">
                        #{t.id} {t.subject} — {t.status}
                    </p>
                ))}
            </div>
        </>
    );
}

SupportIndex.layout = { breadcrumbs };
