<?php

namespace App\Http\Controllers\Astrologer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $profile = $request->user()->astrologerProfile;

        return Inertia::render('astrologer/dashboard', [
            'profile' => $profile ? [
                'status' => $profile->status,
                'rejection_reason' => $profile->rejection_reason,
                'bio' => $profile->bio,
                'specializations' => $profile->specializations ?? [],
                'languages' => $profile->languages ?? [],
                'experience_years' => $profile->experience_years,
                'rate_chat_per_min' => $profile->rate_chat_per_min,
                'rate_call_per_min' => $profile->rate_call_per_min,
                'rate_video_per_min' => $profile->rate_video_per_min,
                'rating_avg' => (float) $profile->rating_avg,
                'rating_count' => $profile->rating_count,
            ] : null,
        ]);
    }
}
