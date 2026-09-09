import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { PoojaFormFields } from './form-fields';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Poojas', href: '/admin/poojas' },
    { title: 'New', href: '/admin/poojas/create' },
];

export default function AdminPoojaCreate() {
    return (
        <>
            <Head title="New Pooja" />
            <div className="mx-auto max-w-xl space-y-6 rounded-xl p-4">
                <Heading title="Add a Pooja" />
                <Card>
                    <CardContent className="pt-6">
                        <Form
                            action="/admin/poojas"
                            method="post"
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
                                    <PoojaFormFields errors={errors} />
                                    <Button type="submit" disabled={processing}>
                                        {processing && <Spinner />}
                                        Create Pooja
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

AdminPoojaCreate.layout = { breadcrumbs };
