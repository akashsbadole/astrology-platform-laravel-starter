import { Form } from '@inertiajs/react';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

type Props = {
    bookingId: number;
    onSubmitted?: () => void;
};

export function ReviewForm({ bookingId, onSubmitted }: Props) {
    const [hovered, setHovered] = useState<number | null>(null);
    const [rating, setRating] = useState(5);

    return (
        <Form
            action={`/customer/bookings/${bookingId}/review`}
            method="post"
            options={{ preserveScroll: true }}
            onSuccess={() => onSubmitted?.()}
            className="space-y-3"
        >
            {({ processing }) => (
                <>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setRating(value)}
                                onMouseEnter={() => setHovered(value)}
                                onMouseLeave={() => setHovered(null)}
                                aria-label={`${value} star${value === 1 ? '' : 's'}`}
                            >
                                <Star
                                    className={`size-5 ${
                                        value <= (hovered ?? rating)
                                            ? 'fill-current text-amber-500'
                                            : 'text-muted-foreground'
                                    }`}
                                />
                            </button>
                        ))}
                        <input type="hidden" name="rating" value={rating} />
                    </div>
                    <Textarea
                        name="comment"
                        rows={2}
                        placeholder="How was your consultation? (optional)"
                    />
                    <Button type="submit" size="sm" disabled={processing}>
                        {processing && <Spinner />}
                        Submit review
                    </Button>
                </>
            )}
        </Form>
    );
}
