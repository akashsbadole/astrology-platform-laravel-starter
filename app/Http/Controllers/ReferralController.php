<?php

namespace App\Http\Controllers;

use App\Services\ReferralService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReferralController extends Controller
{
    public function index(Request $request, ReferralService $referrals): Response|JsonResponse
    {
        $user = $request->user();
        $code = $referrals->codeFor($user);

        $stats = [
            'code' => $code,
            'link' => url('/register?ref='.$code),
            'points' => $user->loyalty_points,
            'balance' => $user->loyaltyBalance(),
            'total_referred' => $user->referralsGiven()->count(),
            'rewarded' => $user->referralsGiven()->where('status', 'rewarded')->count(),
        ];

        $history = $user->loyaltyLedger()->latest()->paginate(15);
        $referralsList = $user->referralsGiven()->with('referred:id,name,created_at')->latest()->paginate(10);

        $payload = [
            'stats' => $stats,
            'history' => $history,
            'referrals' => $referralsList,
        ];

        if ($request->wantsJson()) {
            return response()->json($payload);
        }

        return Inertia::render('referrals/index', $payload);
    }

    public function redeem(Request $request, ReferralService $referrals): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'points' => ['required', 'integer', 'min:10'],
        ]);

        if ($request->user()->loyalty_points < $validated['points']) {
            $msg = 'Not enough points.';
            if ($request->wantsJson()) {
                return response()->json(['message' => $msg], 422);
            }
            return back()->withErrors(['points' => $msg]);
        }

        $referrals->redeem($request->user(), $validated['points']);

        if ($request->wantsJson()) {
            return response()->json(['ok' => true, 'points' => $request->user()->fresh()->loyalty_points]);
        }

        return back()->with('status', $validated['points'].' points redeemed (₹'.$validated['points'].' off your next booking).');
    }
}
