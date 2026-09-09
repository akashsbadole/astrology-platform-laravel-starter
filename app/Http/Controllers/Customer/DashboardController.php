<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\AstrologerProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $featuredAstrologers = AstrologerProfile::query()
            ->approved()
            ->with('user:id,name')
            ->orderByDesc('rating_avg')
            ->limit(6)
            ->get()
            ->map(fn (AstrologerProfile $profile) => [
                'id' => $profile->id,
                'name' => $profile->user->name,
                'specializations' => $profile->specializations ?? [],
                'rating_avg' => (float) $profile->rating_avg,
                'rating_count' => $profile->rating_count,
                'rate_chat_per_min' => $profile->rate_chat_per_min,
            ]);

        return Inertia::render('customer/dashboard', [
            'featuredAstrologers' => $featuredAstrologers,
        ]);
    }
}
