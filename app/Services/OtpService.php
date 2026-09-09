<?php

namespace App\Services;

use App\Models\Otp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

class OtpService
{
    public const CODE_TTL_MINUTES = 5;

    public const MAX_ATTEMPTS = 5;

    /**
     * Issue a new OTP for a phone/email identifier. Returns the plain code
     * (only for log/dev/sms dispatch — never store plain).
     */
    public function request(string $identifier, string $channel = 'sms'): string
    {
        $identifier = strtolower(trim($identifier));

        // Throttle: max 5 requests per 10 minutes per identifier+ip.
        RateLimiter::hit($this->throttleKey($identifier), 600);

        // Invalidate previous unconsumed codes.
        Otp::where('identifier', $identifier)
            ->whereNull('consumed_at')
            ->update(['consumed_at' => now()]);

        $code = (string) random_int(100000, 999999);

        Otp::create([
            'identifier' => $identifier,
            'channel' => $channel,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(self::CODE_TTL_MINUTES),
        ]);

        return $code;
    }

    public function verify(string $identifier, string $code): bool
    {
        $identifier = strtolower(trim($identifier));

        $otp = Otp::where('identifier', $identifier)
            ->whereNull('consumed_at')
            ->latest('id')
            ->first();

        if (! $otp || $otp->isExpired()) {
            return false;
        }

        if ($otp->attempts >= self::MAX_ATTEMPTS) {
            return false;
        }

        $otp->increment('attempts');

        if (! Hash::check($code, $otp->code_hash)) {
            return false;
        }

        $otp->update(['consumed_at' => now()]);
        RateLimiter::clear($this->throttleKey($identifier));

        return true;
    }

    public function tooManyAttempts(string $identifier): bool
    {
        return RateLimiter::tooManyAttempts($this->throttleKey($identifier), 5);
    }

    private function throttleKey(string $identifier): string
    {
        return 'otp:'.$identifier.'|'.request()->ip();
    }
}
