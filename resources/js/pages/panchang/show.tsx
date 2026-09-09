import { Head, router } from '@inertiajs/react';
import { type FormEvent } from 'react';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type Tithi = { number: number; name: string; paksha: string };
type Yoga = { number: number; name: string };
type Karana = { number: number; name: string };
type Nakshatra = { name: string; pada: number };
type Period = { starts_at: string; ends_at: string };

type Props = {
    date: string;
    place: string;
    latitude: number;
    longitude: number;
    utcOffsetHours: number;
    weekday: string;
    sunrise: string;
    sunset: string;
    tithi: Tithi;
    nakshatra: Nakshatra;
    yoga: Yoga;
    karana: Karana;
    inauspiciousPeriods: {
        rahu_kalam: Period;
        yamaganda: Period;
        gulika_kalam: Period;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panchang', href: '/panchang' },
];

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function PanchangShow(props: Props) {
    const search = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const params = Object.fromEntries(
            Array.from(formData.entries()).filter(([, value]) => value !== ''),
        );
        router.get('/panchang', params, { preserveState: true });
    };

    return (
        <>
            <Head title="Panchang" />
            <div className="mx-auto max-w-2xl space-y-6 rounded-xl p-4">
                <Heading
                    title="Today's Panchang"
                    description="Tithi, Nakshatra, Yoga, Karana, and auspicious timings"
                />

                <form
                    onSubmit={search}
                    className="flex flex-wrap items-end gap-3 rounded-lg border p-4"
                >
                    <div className="grid gap-1.5">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            name="date"
                            type="date"
                            defaultValue={props.date}
                        />
                    </div>
                    <div className="grid flex-1 gap-1.5">
                        <Label htmlFor="place">Place</Label>
                        <Input
                            id="place"
                            name="place"
                            defaultValue={props.place}
                            placeholder="City, Country"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-4 text-sm font-medium"
                    >
                        Search
                    </button>
                </form>

                <p className="text-muted-foreground text-sm">
                    {props.weekday}, {props.date} · {props.place}
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Tithi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-medium">
                                {props.tithi.name}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {props.tithi.paksha} Paksha · #
                                {props.tithi.number}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Nakshatra
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-medium">
                                {props.nakshatra.name}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                Pada {props.nakshatra.pada}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Yoga</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-medium">
                                {props.yoga.name}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                #{props.yoga.number}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Karana</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-medium">
                                {props.karana.name}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                #{props.karana.number}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Sun timings</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-between text-sm">
                        <span>Sunrise: {formatTime(props.sunrise)}</span>
                        <span>Sunset: {formatTime(props.sunset)}</span>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Inauspicious timings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Rahu Kalam</span>
                            <span className="text-muted-foreground">
                                {formatTime(
                                    props.inauspiciousPeriods.rahu_kalam
                                        .starts_at,
                                )}{' '}
                                –{' '}
                                {formatTime(
                                    props.inauspiciousPeriods.rahu_kalam
                                        .ends_at,
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Yamaganda</span>
                            <span className="text-muted-foreground">
                                {formatTime(
                                    props.inauspiciousPeriods.yamaganda
                                        .starts_at,
                                )}{' '}
                                –{' '}
                                {formatTime(
                                    props.inauspiciousPeriods.yamaganda.ends_at,
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Gulika Kalam</span>
                            <span className="text-muted-foreground">
                                {formatTime(
                                    props.inauspiciousPeriods.gulika_kalam
                                        .starts_at,
                                )}{' '}
                                –{' '}
                                {formatTime(
                                    props.inauspiciousPeriods.gulika_kalam
                                        .ends_at,
                                )}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

PanchangShow.layout = { breadcrumbs };
