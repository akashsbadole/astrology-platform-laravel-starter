<?php

namespace App\Services;

use App\Models\LoyaltyLedger;
use App\Models\Referral;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReferralService
{
    public const REFERRAL_REWARD_POINTS = 200;

    public const BOOKING_EARN_RATE = 0.05; // 5% of booking amount back as points

    public const POINTS_PER_RUPEE = 1; // 1 point = ₹1 on redeem

    public function codeFor(User $user): string
    {
        return $user->ensureReferralCode();
    }

    public function findReferrer(string $code): ?User
    {
        return User::where('referral_code', strtoupper(trim($code)))->first();
    }

    /**
     * Attach a referral link when a new user registers with a code.
     */
    public function attach(User $newUser, ?string $code): void
    {
        if (! $code || $newUser->referred_by_id) {
            return;
        }

        $referrer = $this->findReferrer($code);

        if (! $referrer || $referrer->id === $newUser->id) {
            return;
        }

        DB::transaction(function () use ($referrer, $newUser, $code) {
            $newUser->forceFill(['referred_by_id' => $referrer->id])->saveQuietly();
            Referral::firstOrCreate(
                ['referred_id' => $newUser->id],
                ['referrer_id' => $referrer->id, 'code' => strtoupper(trim($code)), 'status' => 'pending']
            );
        });
    }

    /**
     * Award loyalty + referral rewards after a successful paid booking.
     * Idempotent per booking reference.
     */
    public function awardForPaidBooking(User $user, string $amount, object $booking, string $kind = 'booking'): void
    {
        DB::transaction(function () use ($user, $amount, $booking, $kind) {
            $earn = (int) floor((float) $amount * self::BOOKING_EARN_RATE);

            if ($earn > 0 && ! $this->alreadyAwarded($user->id, $booking)) {
                LoyaltyLedger::create([
                    'user_id' => $user->id,
                    'points' => $earn,
                    'type' => 'earn',
                    'reference_type' => $booking::class,
                    'reference_id' => $booking->id,
                    'description' => "Earned on {$kind} #{$booking->id}",
                ]);
                $user->increment('loyalty_points', $earn);
            }

            // Referral reward on the referred user's FIRST paid booking.
            $referral = Referral::where('referred_id', $user->id)->where('status', 'pending')->first();
            if ($referral) {
                $referrer = User::find($referral->referrer_id);
                if ($referrer) {
                    foreach ([$referrer, $user] as $beneficiary) {
                        LoyaltyLedger::create([
                            'user_id' => $beneficiary->id,
                            'points' => self::REFERRAL_REWARD_POINTS,
                            'type' => 'referral',
                            'reference_type' => Referral::class,
                            'reference_id' => $referral->id,
                            'description' => 'Referral reward ('.$referral->code.')',
                        ]);
                        $beneficiary->increment('loyalty_points', self::REFERRAL_REWARD_POINTS);
                    }
                }
                $referral->update(['status' => 'rewarded', 'rewarded_at' => now()]);
            }
        });
    }

    /**
     * Redeem points for a discount. Returns discount in rupees.
     */
    public function redeem(User $user, int $points): int
    {
        if ($points <= 0 || $user->loyalty_points < $points) {
            return 0;
        }

        LoyaltyLedger::create([
            'user_id' => $user->id,
            'points' => -$points,
            'type' => 'redeem',
            'description' => 'Redeemed at checkout',
        ]);
        $user->decrement('loyalty_points', $points);

        return (int) floor($points / self::POINTS_PER_RUPEE);
    }

    private function alreadyAwarded(int $userId, object $booking): bool
    {
        return LoyaltyLedger::where('user_id', $userId)
            ->where('reference_type', $booking::class)
            ->where('reference_id', $booking->id)
            ->where('type', 'earn')
            ->exists();
    }

    public static function generateCode(): string
    {
        return strtoupper(Str::random(8));
    }
}
