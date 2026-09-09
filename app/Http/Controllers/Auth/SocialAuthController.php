<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ReferralService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse;

class SocialAuthController extends Controller
{
    public const PROVIDERS = ['google', 'facebook'];

    public function redirect(Request $request, string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, self::PROVIDERS, true), 404);

        if (! class_exists(Socialite::class)) {
            abort(503, 'Social login is not installed. Run: composer require laravel/socialite');
        }

        if (! config("services.{$provider}.client_id")) {
            return redirect()->route('login')->withErrors([
                'email' => ucfirst($provider).' login is not configured yet. Add '.strtoupper($provider).'_CLIENT_ID/SECRET to .env.',
            ]);
        }

        if ($request->query('ref')) {
            $request->session()->put('referral_code', $request->query('ref'));
        }

        return Socialite::driver($provider)->redirect();
    }

    public function callback(Request $request, string $provider, ReferralService $referrals): RedirectResponse
    {
        abort_unless(in_array($provider, self::PROVIDERS, true), 404);

        if (! class_exists(Socialite::class)) {
            abort(503, 'Social login is not installed.');
        }

        try {
            $social = Socialite::driver($provider)->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors(['email' => 'Social login failed. Please try again.']);
        }

        $user = User::where('provider', $provider)->where('provider_id', $social->getId())->first()
            ?? User::where('email', $social->getEmail())->first();

        if (! $user) {
            $user = User::create([
                'name' => $social->getName() ?: explode('@', (string) $social->getEmail())[0],
                'email' => $social->getEmail(),
                'password' => Str::random(32),
                'role' => UserRole::Customer->value,
                'provider' => $provider,
                'provider_id' => $social->getId(),
                'avatar' => $social->getAvatar(),
                'email_verified_at' => now(),
            ]);
            $user->ensureReferralCode();
            $referrals->attach($user, $request->session()->pull('referral_code'));
        } else {
            $user->forceFill([
                'provider' => $provider,
                'provider_id' => $social->getId(),
                'avatar' => $social->getAvatar() ?? $user->avatar,
            ])->saveQuietly();
        }

        Auth::login($user, remember: true);
        $request->session()->regenerate();

        return redirect()->intended('/dashboard');
    }
}
