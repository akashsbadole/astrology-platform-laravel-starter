import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

type PoojaRow = {
    id: number;
    name: string;
    category: string;
    description: string | null;
    duration_minutes: number;
    price: string;
    is_online: boolean;
};

type Props = { poojas: PoojaRow[] };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer/dashboard' },
    { title: 'Poojas', href: '/customer/poojas' },
];

export default function PoojaCatalogIndex({ poojas }: Props) {
    return (
        <>
            <Head title="Poojas" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading
                    title="Book a Pooja"
                    description="Traditional rituals performed on your behalf"
                />

                {poojas.length === 0 ? (
                    <Card>
                        <CardContent className="text-muted-foreground py-10 text-center text-sm">
                            No poojas available right now.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {poojas.map((pooja) => (
                            <Link
                                key={pooja.id}
                                href={`/customer/poojas/${pooja.id}`}
                            >
                                <Card className="hover:border-primary/50 h-full transition-colors">
                                    <CardHeader>
                                        <div className="flex items-center justify-between gap-2">
                                            <CardTitle>{pooja.name}</CardTitle>
                                            <Badge
                                                variant="secondary"
                                                className="capitalize"
                                            >
                                                {pooja.category.replace(
                                                    '_',
                                                    ' ',
                                                )}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {pooja.description && (
                                            <p className="text-muted-foreground line-clamp-2 text-sm">
                                                {pooja.description}
                                            </p>
                                        )}
                                        <p className="text-sm font-medium">
                                            ₹{pooja.price} ·{' '}
                                            {pooja.duration_minutes} min
                                            {pooja.is_online && ' · Online'}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

PoojaCatalogIndex.layout = { breadcrumbs };
