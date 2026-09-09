import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { PoojaFormFields } from './form-fields';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import type { BreadcrumbItem } from '@/types';

type Pooja = {
    id: number;
    name: string;
    category: string;
    description: string | null;
    benefits: string | null;
    vidhi: string | null;
    samagri: string[] | null;
    duration_minutes: number;
    price: string;
    is_online: boolean;
    is_active: boolean;
};

type Props = { pooja: Pooja };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Poojas', href: '/admin/poojas' },
    { title: 'Edit', href: '#' },
];

export default function AdminPoojaEdit({ pooja }: Props) {
    return (
        <>
            <Head title={`Edit ${pooja.name}`} />
            <div className="mx-auto max-w-xl space-y-6 rounded-xl p-4">
                <Heading title={`Edit ${pooja.name}`} />
                <Card>
                    <CardContent className="pt-6">
                        <Form
                            action={`/admin/poojas/${pooja.id}`}
                            method="put"
                            transform={(data) => ({
                                ...data,
                                samagri: (data.samagri_csv as string)
                                    ? (data.samagri_csv as string)
                                          .split(',')
                                          .map((s) => s.trim())
                                          .filter(Boolean)
                                    : [],
                            })}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <PoojaFormFields
                                        pooja={pooja}
                                        errors={errors}
                                    />
                                    <Button type="submit" disabled={processing}>
                                        {processing && <Spinner />}
                                        Save changes
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminPoojaEdit.layout = { breadcrumbs };
