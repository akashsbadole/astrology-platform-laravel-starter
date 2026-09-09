import { Form, Head } from '@inertiajs/react';
import { Star } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import type { BreadcrumbItem } from '@/types';

type AstrologerDetail = {
    id: number;
    name: string;
    bio: string | null;
    specializations: string[];
    languages: string[];
    experience_years: number;
    rating_avg: number;
    rating_count: number;
    rate_chat_per_min: string | null;
    rate_call_per_min: string | null;
    rate_video_per_min: string | null;
};

type AvailabilitySlot = {
    day_of_week: number;
    start_time: string;
    end_time: string;
};

type BusyWindow = { starts_at: string; ends_at: string };

type ReviewItem = {
    id: number;
    customer_name: string;
    rating: number;
    comment: string | null;
    created_at: string;
};

type Props = {
    astrologer: AstrologerDetail;
    availabilitySlots: AvailabilitySlot[];
    upcomingBookings: BusyWindow[];
    reviews: ReviewItem[];
};

const DAYS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer/dashboard' },
    { title: 'Astrologers', href: '/customer/astrologers' },
];

export default function AstrologerShow({
    astrologer,
    availabilitySlots,
    upcomingBookings,
    reviews,
}: Props) {
    const rateOptions = [
        { type: 'chat', label: 'Chat', rate: astrologer.rate_chat_per_min },
        { type: 'call', label: 'Call', rate: astrologer.rate_call_per_min },
        { type: 'video', label: 'Video', rate: astrologer.rate_video_per_min },
    ].filter((option) => option.rate);

    const today = new Date().toISOString().slice(0, 10);

    return (
        <>
            <Head title={astrologer.name} />
            <div className="grid gap-6 rounded-xl p-4 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <div className="flex items-center justify-between gap-2">
                        <Heading title={astrologer.name} />
                        <div className="text-muted-foreground flex items-center gap-1 text-sm">
                            <Star className="size-4 fill-current" />
                            {astrologer.rating_avg.toFixed(1)}
                            <span className="text-xs">
                                ({astrologer.rating_count} reviews)
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {astrologer.specializations.map((specialization) => (
                            <Badge key={specialization} variant="secondary">
                                {specialization}
                            </Badge>
                        ))}
                    </div>

                    {astrologer.bio && (
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            {astrologer.bio}
                        </p>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <p>
                                {astrologer.experience_years} years of
                                experience
                            </p>
                            <p>
                                Languages:{' '}
                                {astrologer.languages.join(', ') || '—'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Weekly availability
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {availabilitySlots.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    No availability set yet.
                                </p>
                            ) : (
                                <ul className="space-y-1 text-sm">
                                    {availabilitySlots.map((slot, index) => (
                                        <li key={index}>
                                            <span className="font-medium">
                                                {DAYS[slot.day_of_week]}
                                            </span>
                                            : {slot.start_time} –{' '}
                                            {slot.end_time}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    {upcomingBookings.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Already booked (next 14 days)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="text-muted-foreground space-y-1 text-sm">
                                    {upcomingBookings.map((window, index) => (
                                        <li key={index}>
                                            {new Date(
                                                window.starts_at,
                                            ).toLocaleString()}{' '}
                                            –{' '}
                                            {new Date(
                                                window.ends_at,
                                            ).toLocaleTimeString()}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Reviews
                                {reviews.length > 0 && ` (${reviews.length})`}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {reviews.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    No reviews yet.
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {reviews.map((review) => (
                                        <li
                                            key={review.id}
                                            className="border-b pb-3 last:border-0 last:pb-0"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">
                                                    {review.customer_name}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-amber-500">
                                                    {'★'.repeat(review.rating)}
                                                    {'☆'.repeat(
                                                        5 - review.rating,
                                                    )}
                                                </span>
                                            </div>
                                            {review.comment && (
                                                <p className="text-muted-foreground mt-1 text-sm">
                                                    {review.comment}
                                                </p>
                                            )}
                                            <p className="text-muted-foreground mt-1 text-xs">
                                                {review.created_at}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="h-fit lg:sticky lg:top-4">
                    <CardHeader>
                        <CardTitle>Book a consultation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {rateOptions.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                                This astrologer hasn't set up consultation rates
                                yet.
                            </p>
                        ) : (
                            <Form
                                action="/customer/bookings"
                                method="post"
                                transform={(data) => ({
                                    astrologer_profile_id: astrologer.id,
                                    consultation_type: data.consultation_type,
                                    duration_minutes: data.duration_minutes,
                                    customer_notes: data.customer_notes,
                                    scheduled_at: `${data.date}T${data.time}`,
                                })}
                                className="space-y-4"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label>Consultation type</Label>
                                            <div className="flex gap-2">
                                                {rateOptions.map(
                                                    (option, index) => (
                                                        <label
                                                            key={option.type}
                                                            className="has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex flex-1 cursor-pointer flex-col items-center rounded-md border px-2 py-2 text-xs"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="consultation_type"
                                                                value={
                                                                    option.type
                                                                }
                                                                defaultChecked={
                                                                    index === 0
                                                                }
                                                                className="sr-only"
                                                            />
                                                            <span className="font-medium">
                                                                {option.label}
                                                            </span>
                                                            <span className="text-muted-foreground">
                                                                ₹{option.rate}
                                                                /min
                                                            </span>
                                                        </label>
                                                    ),
                                                )}
                                            </div>
                                            <InputError
                                                message={
                                                    errors.consultation_type
                                                }
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="grid gap-2">
                                                <Label htmlFor="date">
                                                    Date
                                                </Label>
                                                <input
                                                    id="date"
                                                    name="date"
                                                    type="date"
                                                    min={today}
                                                    required
                                                    className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="time">
                                                    Time
                                                </Label>
                                                <input
                                                    id="time"
                                                    name="time"
                                                    type="time"
                                                    required
                                                    className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <InputError
                                            message={errors.scheduled_at}
                                        />

                                        <div className="grid gap-2">
                                            <Label htmlFor="duration_minutes">
                                                Duration
                                            </Label>
                                            <select
                                                id="duration_minutes"
                                                name="duration_minutes"
                                                defaultValue={15}
                                                className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                            >
                                                <option value={15}>
                                                    15 minutes
                                                </option>
                                                <option value={30}>
                                                    30 minutes
                                                </option>
                                                <option value={60}>
                                                    60 minutes
                                                </option>
                                            </select>
                                            <InputError
                                                message={
                                                    errors.duration_minutes
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="customer_notes">
                                                What would you like to ask
                                                about? (optional)
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
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AstrologerShow.layout = { breadcrumbs };
