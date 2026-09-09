import { Form, Head, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';

type TaxonomyItem = { id: number; name: string; is_active: boolean };

type Props = {
    specializations: TaxonomyItem[];
    languages: TaxonomyItem[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Taxonomies', href: '/admin/taxonomies' },
];

const TYPE_LABELS = {
    specialization: 'Specializations',
    language: 'Languages',
} as const;

function TaxonomyList({
    type,
    items,
}: {
    type: 'specialization' | 'language';
    items: TaxonomyItem[];
}) {
    const toggle = (item: TaxonomyItem) => {
        router.patch(
            `/admin/taxonomies/${item.id}`,
            { is_active: !item.is_active },
            { preserveScroll: true },
        );
    };

    const remove = (item: TaxonomyItem) => {
        if (!window.confirm(`Remove "${item.name}"?`)) {
            return;
        }
        router.delete(`/admin/taxonomies/${item.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{TYPE_LABELS[type]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Form
                    action="/admin/taxonomies"
                    method="post"
                    options={{ preserveScroll: true }}
                    resetOnSuccess
                    className="flex gap-2"
                >
                    <input type="hidden" name="type" value={type} />
                    <Input
                        name="name"
                        placeholder={`Add a new ${type}`}
                        required
                        className="flex-1"
                    />
                    <Button type="submit" size="sm">
                        Add
                    </Button>
                </Form>

                <ul className="divide-y">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-center justify-between py-2"
                        >
                            <span className="flex items-center gap-2 text-sm">
                                {item.name}
                                {!item.is_active && (
                                    <Badge variant="secondary">Hidden</Badge>
                                )}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggle(item)}
                                >
                                    {item.is_active ? 'Hide' : 'Show'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => remove(item)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

export default function AdminTaxonomiesIndex({
    specializations,
    languages,
}: Props) {
    return (
        <>
            <Head title="Taxonomies" />
            <div className="grid gap-6 rounded-xl p-4 lg:grid-cols-2">
                <div className="lg:col-span-2">
                    <Heading
                        title="Specializations & languages"
                        description="Manage the options astrologers can select on their profile"
                    />
                </div>
                <TaxonomyList type="specialization" items={specializations} />
                <TaxonomyList type="language" items={languages} />
            </div>
        </>
    );
}

AdminTaxonomiesIndex.layout = { breadcrumbs };
