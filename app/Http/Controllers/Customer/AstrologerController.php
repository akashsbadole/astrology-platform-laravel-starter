<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\AstrologerAvailability;
use App\Models\AstrologerProfile;
use App\Models\Booking;
use App\Models\Taxonomy;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AstrologerController extends Controller
{
    public function index(Request $request): Response
    {
        $specialization = $request->string('specialization')->toString() ?: null;
        $language = $request->string('language')->toString() ?: null;
        $maxRate = $request->input('max_rate');
        $sort = $request->string('sort')->toString() ?: 'rating';

        $astrologers = AstrologerProfile::query()
            ->approved()
            ->with('user:id,name')
            ->when($specialization, fn ($query) => $query->whereJsonContains('specializations', $specialization))
            ->when($language, fn ($query) => $query->whereJsonContains('languages', $language))
            ->when($maxRate, fn ($query) => $query->where('rate_chat_per_min', '<=', $maxRate))
            ->when($sort === 'rating', fn ($query) => $query->orderByDesc('rating_avg'))
            ->when($sort === 'price', fn ($query) => $query->orderBy('rate_chat_per_min'))
            ->when($sort === 'experience', fn ($query) => $query->orderByDesc('experience_years'))
            ->paginate(12)
            ->withQueryString()
            ->through(fn (AstrologerProfile $profile) => [
                'id' => $profile->id,
                'user_id' => $profile->user_id,
                'name' => $profile->user->name,
                'specializations' => $profile->specializations ?? [],
                'languages' => $profile->languages ?? [],
                'experience_years' => $profile->experience_years,
                'rating_avg' => (float) $profile->rating_avg,
                'rating_count' => $profile->rating_count,
                'rate_chat_per_min' => $profile->rate_chat_per_min,
            ]);

        return Inertia::render('customer/astrologers/index', [
            'astrologers' => $astrologers,
            'filters' => [
                'specialization' => $specialization,
                'language' => $language,
                'max_rate' => $maxRate,
                'sort' => $sort,
            ],
            'specializationOptions' => Taxonomy::activeNames('specialization'),
            'languageOptions' => Taxonomy::activeNames('language'),
        ]);
    }

    public function show(Request $request, AstrologerProfile $astrologer): Response
    {
        abort_unless($astrologer->isApproved(), 404);

        $astrologer->load('user:id,name');

        $slots = $astrologer->user
            ->availabilities()
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->map(fn (AstrologerAvailability $slot) => [
                'day_of_week' => $slot->day_of_week,
                'start_time' => substr($slot->start_time, 0, 5),
                'end_time' => substr($slot->end_time, 0, 5),
            ]);

        // Next 14 days of confirmed bookings, so the frontend can grey out taken times.
        $upcomingBookings = Booking::query()
            ->where('astrologer_id', $astrologer->user_id)
            ->where('status', 'confirmed')
            ->whereBetween('scheduled_at', [now(), now()->addDays(14)])
            ->get(['scheduled_at', 'duration_minutes'])
            ->map(fn (Booking $booking) => [
                'starts_at' => $booking->scheduled_at->toIso8601String(),
                'ends_at' => $booking->endsAt()->toIso8601String(),
            ]);

        $reviews = $astrologer->reviews()
            ->with('customer:id,name')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($review) => [
                'id' => $review->id,
                'customer_name' => $review->customer->name,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'created_at' => $review->created_at->diffForHumans(),
            ]);

        return Inertia::render('customer/astrologers/show', [
            'astrologer' => [
                'id' => $astrologer->id,
                'name' => $astrologer->user->name,
                'bio' => $astrologer->bio,
                'specializations' => $astrologer->specializations ?? [],
                'languages' => $astrologer->languages ?? [],
                'experience_years' => $astrologer->experience_years,
                'rating_avg' => (float) $astrologer->rating_avg,
                'rating_count' => $astrologer->rating_count,
                'rate_chat_per_min' => $astrologer->rate_chat_per_min,
                'rate_call_per_min' => $astrologer->rate_call_per_min,
                'rate_video_per_min' => $astrologer->rate_video_per_min,
            ],
            'availabilitySlots' => $slots,
            'upcomingBookings' => $upcomingBookings,
            'reviews' => $reviews,
            'timezone' => config('app.timezone'),
            'now' => Carbon::now()->toIso8601String(),
        ]);
    }
}
