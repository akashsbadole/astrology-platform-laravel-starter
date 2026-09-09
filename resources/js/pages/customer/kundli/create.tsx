import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer/dashboard' },
    { title: 'Kundli', href: '/customer/kundli' },
    { title: 'New', href: '/customer/kundli/create' },
];

const UTC_OFFSETS = [
    { label: 'IST (UTC+5:30) — India', value: 5.5 },
    { label: 'UTC', value: 0 },
    { label: 'UTC-5 — US Eastern (standard)', value: -5 },
    { label: 'UTC-8 — US Pacific (standard)', value: -8 },
    { label: 'UTC+1 — Central Europe', value: 1 },
    { label: 'UTC+4 — Gulf', value: 4 },
    { label: 'UTC+8 — Singapore/China', value: 8 },
];

export default function KundliCreate() {
    return (
        <>
            <Head title="New Kundli" />
            <div className="mx-auto max-w-xl space-y-6 rounded-xl p-4">
                <Heading
                    title="Generate a Kundli"
                    description="Enter exact birth details for the most accurate chart"
                />

                <Card>
                    <CardContent className="pt-6">
                        <Form
                            action="/customer/kundli"
                            method="post"
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="profile_name">
                                            Whose Kundli is this?
                                        </Label>
                                        <Input
                                            id="profile_name"
                                            name="profile_name"
                                            placeholder="e.g. Self, My Son, Priya"
                                            required
                                        />
                                        <InputError
                                            message={errors.profile_name}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="gender">
                                            Gender (optional)
                                        </Label>
                                        <select
                                            id="gender"
                                            name="gender"
                                            defaultValue=""
                                            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                        >
                                            <option value="">
                                                Prefer not to say
                                            </option>
                                            <option value="male">Male</option>
                                            <option value="female">
                                                Female
                                            </option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="date_of_birth">
                                                Date of birth
                                            </Label>
                                            <Input
                                                id="date_of_birth"
                                                name="date_of_birth"
                                                type="date"
                                                required
                                            />
                                            <InputError
                                                message={errors.date_of_birth}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="time_of_birth">
                                                Time of birth
                                            </Label>
                                            <Input
                                                id="time_of_birth"
                                                name="time_of_birth"
                                                type="time"
                                                required
                                            />
                                            <InputError
                                                message={errors.time_of_birth}
                                            />
                                            <p className="text-muted-foreground text-xs">
                                                As exact as possible — the
                                                Ascendant is sensitive to birth
                                                time.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="utc_offset_hours">
                                            Time zone at birth
                                        </Label>
                                        <select
                                            id="utc_offset_hours"
                                            name="utc_offset_hours"
                                            defaultValue={5.5}
                                            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                        >
                                            {UTC_OFFSETS.map((option) => (
                                                <option
                                                    key={option.label}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors.utc_offset_hours}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="birth_place">
                                            Birth place
                                        </Label>
                                        <Input
                                            id="birth_place"
                                            name="birth_place"
                                            placeholder="City, State, Country"
                                            required
                                        />
                                        <InputError
                                            message={errors.birth_place}
                                        />
                                        <p className="text-muted-foreground text-xs">
                                            We'll look up coordinates
                                            automatically. If it can't be found,
                                            enter latitude/longitude below.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="latitude">
                                                Latitude (optional)
                                            </Label>
                                            <Input
                                                id="latitude"
                                                name="latitude"
                                                type="number"
                                                step="any"
                                                placeholder="e.g. 28.6139"
                                            />
                                            <InputError
                                                message={errors.latitude}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="longitude">
                                                Longitude (optional)
                                            </Label>
                                            <Input
                                                id="longitude"
                                                name="longitude"
                                                type="number"
                                                step="any"
                                                placeholder="e.g. 77.2090"
                                            />
                                            <InputError
                                                message={errors.longitude}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={processing}
                                    >
                                        {processing && <Spinner />}
                                        Generate Kundli
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

KundliCreate.layout = { breadcrumbs };
