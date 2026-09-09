import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Support inbox', href: '#' }];

export default function SupportInbox({
    tickets,
}: {
    tickets: {
        data: Array<{
            id: number;
            subject: string;
            status: string;
            user_id: number;
        }>;
    };
}) {
    return (
        <>
            <Head title="Support" />
            <div className="space-y-2 p-4">
                <Heading title="Support tickets" />
                {tickets.data.map((t) => (
                    <Card key={t.id}>
                        <CardContent className="py-2 text-sm">
                            #{t.id} user {t.user_id} — {t.subject} · {t.status}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
SupportInbox.layout = { breadcrumbs };
