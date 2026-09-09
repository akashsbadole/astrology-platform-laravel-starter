<?php

namespace App\Http\Controllers\Customer;

use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Models\AstrologerAvailability;
use App\Models\AstrologerProfile;
use App\Models\Booking;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    private const ALLOWED_DURATIONS = [15, 30, 60];

    public function index(Request $request): Response
    {
        $bookings = $request->user()
            ->bookingsAsCustomer()
            ->with(['astrologer:id,name', 'review'])
            ->latest('scheduled_at')
            ->paginate(10)
            ->through(fn (Booking $booking) => $this->present($booking));

        return Inertia::render('customer/bookings/index', [
            'bookings' => $bookings,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'astrologer_profile_id' => ['required', 'integer', 'exists:astrologer_profiles,id'],
            'consultation_type' => ['required', Rule::in(['chat', 'call', 'video'])],
            'scheduled_at' => ['required', 'date', 'after:now'],
            'duration_minutes' => ['required', 'integer', Rule::in(self::ALLOWED_DURATIONS)],
            'customer_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $profile = AstrologerProfile::query()->approved()->findOrFail($validated['astrologer_profile_id']);

        $rateColumn = "rate_{$validated['consultation_type']}_per_min";
        $ratePerMin = $profile->{$rateColumn};

        if (! $ratePerMin) {
            throw ValidationException::withMessages([
                'consultation_type' => 'This astrologer has not set a rate for that consultation type.',
            ]);
        }

        $start = Carbon::parse($validated['scheduled_at']);
        $end = $start->clone()->addMinutes($validated['duration_minutes']);

        $this->assertWithinAvailability($profile->user_id, $start, $end);

        if (Booking::hasConfirmedOverlap($profile->user_id, $start, $end)) {
            throw ValidationException::withMessages([
                'scheduled_at' => 'That slot was just booked by someone else. Please pick another time.',
            ]);
        }

        $booking = Booking::create([
            'customer_id' => $request->user()->id,
            'astrologer_id' => $profile->user_id,
            'consultation_type' => $validated['consultation_type'],
            'scheduled_at' => $start,
            'duration_minutes' => $validated['duration_minutes'],
            'rate_per_min' => $ratePerMin,
            'amount' => round($ratePerMin * $validated['duration_minutes'], 2),
            'status' => BookingStatus::PendingPayment,
            'customer_notes' => $validated['customer_notes'] ?? null,
        ]);

        return redirect()->route('customer.bookings.checkout', $booking);
    }

    public function checkout(Request $request, Booking $booking): Response
    {
        abort_unless($booking->customer_id === $request->user()->id, 403);

        $booking->load('astrologer:id,name');

        return Inertia::render('customer/bookings/checkout', [
            'booking' => $this->present($booking),
            'razorpayKeyId' => config('services.razorpay.key_id'),
        ]);
    }

    private function present(Booking $booking): array
    {
        return [
            'id' => $booking->id,
            'astrologer_name' => $booking->astrologer->name,
            'consultation_type' => $booking->consultation_type->value,
            'scheduled_at' => $booking->scheduled_at->toIso8601String(),
            'duration_minutes' => $booking->duration_minutes,
            'amount' => $booking->amount,
            'status' => $booking->status->value,
            'payment_status' => $booking->payment_status->value,
            'is_session_active' => $booking->isSessionActive(),
            'has_review' => $booking->relationLoaded('review')
                ? $booking->review !== null
                : $booking->review()->exists(),
        ];
    }

    private function assertWithinAvailability(int $astrologerId, Carbon $start, Carbon $end): void
    {
        if ($start->toDateString() !== $end->toDateString()) {
            throw ValidationException::withMessages([
                'scheduled_at' => 'Sessions cannot span past midnight.',
            ]);
        }

        $dayOfWeek = $start->dayOfWeek;
        $startTime = $start->format('H:i');
        $endTime = $end->format('H:i');

        $fits = AstrologerAvailability::query()
            ->where('user_id', $astrologerId)
            ->where('day_of_week', $dayOfWeek)
            ->where('start_time', '<=', $startTime)
            ->where('end_time', '>=', $endTime)
            ->exists();

        if (! $fits) {
            throw ValidationException::withMessages([
                'scheduled_at' => 'That time falls outside the astrologer\'s available hours.',
            ]);
        }
    }
}
