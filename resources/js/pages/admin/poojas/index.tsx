import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

type PoojaRow = {
    id: number;
    name: string;
    category: string;
    price: string;
    is_active: boolean;
};

type Props = { poojas: PoojaRow[] };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Poojas', href: '/admin/poojas' },
];

export default function AdminPoojasIndex({ poojas }: Props) {
    const remove = (id: number) => {
        if (!window.confirm('Delete this pooja?')) return;
        router.delete(`/admin/poojas/${id}`, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Poojas" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        title="Poojas"
                        description="Manage the pooja catalog"
                    />
                    <Button asChild>
                        <Link href="/admin/poojas/create">
                            <Plus className="size-4" />
                            Add Pooja
                        </Link>
                    </Button>
                </div>

                <div className="space-y-3">
                    {poojas.map((pooja) => (
                        <Card key={pooja.id}>
                            <CardContent className="flex items-center justify-between gap-3 py-4">
                                <div>
                                    <p className="font-medium">{pooja.name}</p>
                                    <p className="text-muted-foreground text-sm capitalize">
                                        {pooja.category.replace('_', ' ')} · ₹
                                        {pooja.price}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!pooja.is_active && (
                                        <Badge variant="secondary">
                                            Hidden
                                        </Badge>
                                    )}
                                    <Button size="sm" variant="outline" asChild>
                                        <Link
                                            href={`/admin/poojas/${pooja.id}/edit`}
                                        >
                                            Edit
                                        </Link>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => remove(pooja.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

AdminPoojasIndex.layout = { breadcrumbs };
