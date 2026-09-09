<?php

namespace App\Providers;

use App\Models\PersonalAccessToken;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureSanctumGuard();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Stateless Bearer-token guard for the mobile app (routes/api.php "auth:sanctum").
     * Tokens are "{id}|{plain}" personal access tokens; only SHA-256 hashes are stored.
     */
    protected function configureSanctumGuard(): void
    {
        Auth::viaRequest('sanctum-token', function (Request $request): ?User {
            $bearer = $request->bearerToken();

            if (! $bearer) {
                return null;
            }

            $token = PersonalAccessToken::findToken($bearer);

            if (! $token || ($token->expires_at && $token->expires_at->isPast())) {
                return null;
            }

            $user = $token->tokenable;

            if (! $user instanceof User) {
                return null;
            }

            // Throttle last_used_at writes to once per minute per token.
            if ($token->last_used_at === null || $token->last_used_at->lt(now()->subMinute())) {
                $token->forceFill(['last_used_at' => now()])->saveQuietly();
            }

            return $user;
        });
    }
}

