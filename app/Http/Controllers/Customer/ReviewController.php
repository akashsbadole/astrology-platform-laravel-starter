<?php

namespace App\Http\Controllers\Customer;

use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Models\AstrologerProfile;
use App\Models\Booking;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, Booking $booking): RedirectResponse
    {
        abort_unless($booking->customer_id === $request->user()->id, 403);
        abort_unless($booking->status === BookingStatus::Completed, 422, 'You can only review completed sessions.');
        abort_if($booking->review()->exists(), 422, 'You already reviewed this session.');

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $booking->review()->create([
            'customer_id' => $booking->customer_id,
            'astrologer_id' => $booking->astrologer_id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        $this->recalculateRating($booking->astrologer_id);

        return back()->with('status', 'review-submitted');
    }

    private function recalculateRating(int $astrologerId): void
    {
        $stats = Review::query()
            ->where('astrologer_id', $astrologerId)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total')
            ->first();

        AstrologerProfile::query()
            ->where('user_id', $astrologerId)
            ->update([
                'rating_avg' => round((float) $stats->avg_rating, 2),
                'rating_count' => (int) $stats->total,
            ]);
    }
}
