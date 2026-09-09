import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import type { BreadcrumbItem } from '@/types';

type PoojaDetail = {
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
};

type Props = { pooja: PoojaDetail };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer/dashboard' },
    { title: 'Poojas', href: '/customer/poojas' },
];

export default function PoojaShow({ pooja }: Props) {
    const today = new Date().toISOString().slice(0, 10);

    return (
        <>
            <Head title={pooja.name} />
            <div className="grid gap-6 rounded-xl p-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <Heading title={pooja.name} />
                    {pooja.description && (
                        <p className="text-muted-foreground text-sm">
                            {pooja.description}
                        </p>
                    )}
                    {pooja.benefits && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Benefits
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm">
                                {pooja.benefits}
                            </CardContent>
                        </Card>
                    )}
                    {pooja.vidhi && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Vidhi (Procedure)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm whitespace-pre-line">
                                {pooja.vidhi}
                            </CardContent>
                        </Card>
                    )}
                    {pooja.samagri && pooja.samagri.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Samagri (Ingredients)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-1.5">
                                {pooja.samagri.map((item) => (
                                    <Badge key={item} variant="secondary">
                                        {item}
                                    </Badge>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Book this Pooja</CardTitle>
                        <p className="text-muted-foreground text-sm">
                            ₹{pooja.price} · {pooja.duration_minutes} min
                        </p>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={`/customer/poojas/${pooja.id}/bookings`}
                            method="post"
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="scheduled_date">
                                            Preferred date
                                        </Label>
                                        <Input
                                            id="scheduled_date"
                                            name="scheduled_date"
                                            type="date"
                                            min={today}
                                            required
                                        />
                                        <InputError
                                            message={errors.scheduled_date}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="customer_notes">
                                            Notes (optional)
                                        </Label>
                                        <Textarea
                                            id="customer_notes"
                                            name="customer_notes"
                                            rows={3}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={processing}
                                    >
                                        {processing && <Spinner />}
                                        Continue to payment
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

PoojaShow.layout = { breadcrumbs };
