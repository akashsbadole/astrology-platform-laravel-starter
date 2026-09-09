<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\OtpCode;
use App\Services\OtpService;
use App\Services\ReferralService;
use App\Services\SmsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\JsonResponse;

class OtpController extends Controller
{
        public function __construct(
        private readonly OtpService $otps,
        private readonly SmsService $sms,
    ) {}

    public function showRequest(): Response
    {
        return Inertia::render('auth/otp-request');
    }

    public function request(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'identifier' => ['required', 'string', 'max:100'],
        ]);

        $identifier = strtolower(trim($validated['identifier']));

        if ($this->otps->tooManyAttempts($identifier)) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Too many attempts. Please try again in 10 minutes.'], 429);
            }
            return back()->withErrors(['identifier' => 'Too many attempts. Please try again in 10 minutes.']);
        }

        $isPhone = preg_match('/^[+\d][\d\s\-]{6,}$/', $identifier);
        $code = $this->otps->request($identifier, $isPhone ? 'sms' : 'email');

        if ($isPhone) {
            $this->sms->send($identifier, 'Your Astro login code is '.$code.'. Valid for 5 minutes.');
        } else {
            $user = User::where('email', $identifier)->first();
            if ($user) {
                $user->notify(new OtpCode($code));
            } else {
                // No account yet — still pretend success, code shown in logs for dev.
                Log::info('[OTP] email='.$identifier.' code='.$code);
            }
        }

        if ($request->wantsJson()) {
            return response()->json([
                'message' => $isPhone ? 'OTP sent via SMS.' : 'OTP sent via email.',
                'identifier' => $identifier,
                'channel' => $isPhone ? 'sms' : 'email',
                'debug_code' => app()->isLocal() ? $code : null,
            ]);
        }

        return redirect()->route('otp.verify.show', ['identifier' => $identifier]);
    }

    public function showVerify(Request $request): Response
    {
        return Inertia::render('auth/otp-verify', [
            'identifier' => $request->query('identifier', ''),
        ]);
    }

    public function verify(Request $request, ReferralService $referrals): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'identifier' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        $identifier = strtolower(trim($validated['identifier']));

        if (! $this->otps->verify($identifier, $validated['code'])) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Invalid or expired code.'], 422);
            }
            return back()->withErrors(['code' => 'Invalid or expired code.']);
        }

        $isPhone = preg_match('/^[+\d][\d\s\-]{6,}$/', $identifier);

        $user = $isPhone
            ? User::where('phone', $identifier)->first()
            : User::where('email', $identifier)->first();

        if (! $user) {
            // Auto-register on first OTP login.
            $user = User::create([
                'name' => $isPhone ? 'User '.substr($identifier, -4) : explode('@', $identifier)[0],
                'email' => $isPhone ? $identifier.'@otp.local' : $identifier,
                'password' => Str::random(32),
                'role' => 'customer',
                'phone' => $isPhone ? $identifier : null,
                'phone_verified_at' => now(),
            ]);
            $user->ensureReferralCode();
            $refCode = $request->hasSession() ? $request->session()->get('referral_code') : null;
            $referrals->attach($user, $refCode);
        } elseif ($isPhone && ! $user->phone_verified_at) {
            $user->forceFill(['phone_verified_at' => now()])->saveQuietly();
        }

        // Mobile/API flow: return a personal access token instead of a session.
        if ($request->wantsJson()) {
            $token = $user->createToken('mobile');

            return response()->json([
                'token' => $token->plainTextToken,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role->value,
                    'referral_code' => $user->referral_code,
                ],
            ]);
        }

        Auth::login($user, remember: true);
        $request->session()->regenerate();

        return redirect()->intended('/dashboard');
    }
}
