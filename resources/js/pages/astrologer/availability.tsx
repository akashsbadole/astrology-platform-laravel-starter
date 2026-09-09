import { Form, Head, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { BreadcrumbItem } from '@/types';

type Slot = {
    id: number;
    day_of_week: number;
    day_label: string;
    start_time: string;
    end_time: string;
};

type Props = {
    slots: Slot[];
    days: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/astrologer/dashboard' },
    { title: 'Availability', href: '/astrologer/availability' },
];

export default function AstrologerAvailability({ slots, days }: Props) {
    const remove = (id: number) => {
        router.delete(`/astrologer/availability/${id}`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Availability" />
            <div className="grid gap-6 rounded-xl p-4 lg:grid-cols-2">
                <div className="lg:col-span-2">
                    <Heading
                        title="Availability"
                        description="Set the weekly hours customers can book you"
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Add a weekly slot</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action="/astrologer/availability"
                            method="post"
                            options={{ preserveScroll: true }}
                            resetOnSuccess
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="day_of_week">Day</Label>
                                        <select
                                            id="day_of_week"
                                            name="day_of_week"
                                            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                        >
                                            {days.map((day, index) => (
                                                <option key={day} value={index}>
                                                    {day}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors.day_of_week}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="start_time">
                                                Start time
                                            </Label>
                                            <input
                                                id="start_time"
                                                name="start_time"
                                                type="time"
                                                required
                                                className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                            />
                                            <InputError
                                                message={errors.start_time}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="end_time">
                                                End time
                                            </Label>
                                            <input
                                                id="end_time"
                                                name="end_time"
                                                type="time"
                                                required
                                                className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                            />
                                            <InputError
                                                message={errors.end_time}
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={processing}>
                                        {processing && <Spinner />}
                                        Add slot
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Your weekly schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {slots.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                                No availability set. Customers can't book you
                                until you add some slots.
                            </p>
                        ) : (
                            <ul className="divide-y text-sm">
                                {slots.map((slot) => (
                                    <li
                                        key={slot.id}
                                        className="flex items-center justify-between py-2"
                                    >
                                        <span>
                                            <span className="font-medium">
                                                {slot.day_label}
                                            </span>{' '}
                                            {slot.start_time} – {slot.end_time}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => remove(slot.id)}
                                        >
                                            Remove
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AstrologerAvailability.layout = { breadcrumbs };
