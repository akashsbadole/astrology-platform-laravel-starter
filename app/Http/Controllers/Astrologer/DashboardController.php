<?php

namespace App\Http\Controllers\Astrologer;

use App\Http\Controllers\Controller;
use App\Models\AstrologerEarning;
use App\Models\Consultation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response|JsonResponse
    {
        $user = $request->user();
        $profile = $user->astrologerProfile;

        $earnings = [
            'total_paise' => 0,
            'pending_paise' => 0,
            'this_month_paise' => 0,
            'total_consultations' => 0,
        ];

        if ($profile) {
            $earnings = [
                'total_paise' => AstrologerEarning::where('astrologer_id', $user->id)->whereIn('status', ['payable', 'paid'])->sum('net_paise'),
                'pending_paise' => AstrologerEarning::where('astrologer_id', $user->id)->where('status', 'payable')->sum('net_paise'),
                'this_month_paise' => AstrologerEarning::where('astrologer_id', $user->id)->where('status', 'payable')->whereMonth('created_at', now()->month)->sum('net_paise'),
                'total_consultations' => Consultation::where('astrologer_id', $user->id)->where('status', 'ended')->count(),
            ];
        }

        $payload = [
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
            'earnings' => $earnings,
        ];

        if ($request->wantsJson()) {
            return response()->json($payload);
        }

        return Inertia::render('astrologer/dashboard', $payload);
    }
}
