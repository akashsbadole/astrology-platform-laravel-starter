import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

type KundliRow = {
    id: number;
    profile_name: string;
    date_of_birth: string;
    birth_place: string;
    moon_rashi: string;
    moon_nakshatra: string;
};

type Props = {
    kundlis: KundliRow[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer/dashboard' },
    { title: 'Kundli', href: '/customer/kundli' },
];

export default function KundliIndex({ kundlis }: Props) {
    const remove = (id: number) => {
        if (!window.confirm('Delete this Kundli?')) {
            return;
        }
        router.delete(`/customer/kundli/${id}`);
    };

    return (
        <>
            <Head title="My Kundlis" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        title="My Kundlis"
                        description="Generate and view birth charts for yourself or family"
                    />
                    <Button asChild>
                        <Link href="/customer/kundli/create">
                            <Plus className="size-4" />
                            New Kundli
                        </Link>
                    </Button>
                </div>

                {kundlis.length === 0 ? (
                    <Card>
                        <CardContent className="text-muted-foreground py-10 text-center text-sm">
                            You haven't generated a Kundli yet.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {kundlis.map((kundli) => (
                            <Card key={kundli.id} className="relative">
                                <Link
                                    href={`/customer/kundli/${kundli.id}`}
                                    className="block"
                                >
                                    <CardContent className="space-y-1 pt-6">
                                        <p className="font-medium">
                                            {kundli.profile_name}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            Born {kundli.date_of_birth} ·{' '}
                                            {kundli.birth_place}
                                        </p>
                                        <p className="text-sm">
                                            Moon sign: {kundli.moon_rashi}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            Nakshatra: {kundli.moon_nakshatra}
                                        </p>
                                    </CardContent>
                                </Link>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-2 right-2"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        remove(kundli.id);
                                    }}
                                >
                                    Delete
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

KundliIndex.layout = { breadcrumbs };
