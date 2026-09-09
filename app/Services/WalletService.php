<?php

namespace App\Services;

use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WalletService
{
    public function walletFor(User $user): Wallet
    {
        return Wallet::firstOrCreate(['user_id' => $user->id], ['balance_paise' => 0]);
    }

    public function balancePaise(User $user): int
    {
        return $this->walletFor($user)->balance_paise;
    }

    public function credit(User $user, int $amountPaise, string $idempotencyKey, object|string|null $reference = null, string $type = 'credit', array $meta = []): WalletTransaction
    {
        return DB::transaction(function () use ($user, $amountPaise, $idempotencyKey, $reference, $type, $meta) {
            $existing = WalletTransaction::where('idempotency_key', $idempotencyKey)->first();
            if ($existing) {
                return $existing;
            }
            $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->first()
                ?? Wallet::create(['user_id' => $user->id, 'balance_paise' => 0]);
            $wallet->balance_paise += $amountPaise;
            $wallet->save();
            [$rtype, $rid] = $this->morphParts($reference);

            return WalletTransaction::create([
                'user_id' => $user->id,
                'type' => $type,
                'amount_paise' => $amountPaise,
                'balance_after_paise' => $wallet->balance_paise,
                'reference_type' => $rtype,
                'reference_id' => $rid,
                'idempotency_key' => $idempotencyKey,
                'meta' => $meta,
            ]);
        });
    }

    public function debit(User $user, int $amountPaise, string $idempotencyKey, object|string|null $reference = null, string $type = 'debit', array $meta = []): WalletTransaction
    {
        return DB::transaction(function () use ($user, $amountPaise, $idempotencyKey, $reference, $type, $meta) {
            $existing = WalletTransaction::where('idempotency_key', $idempotencyKey)->first();
            if ($existing) {
                return $existing;
            }
            $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->first()
                ?? Wallet::create(['user_id' => $user->id, 'balance_paise' => 0]);
            abort_if($wallet->balance_paise < $amountPaise, 422, 'Insufficient wallet balance. Please recharge.');
            $wallet->balance_paise -= $amountPaise;
            $wallet->save();
            [$rtype, $rid] = $this->morphParts($reference);

            return WalletTransaction::create([
                'user_id' => $user->id,
                'type' => $type,
                'amount_paise' => -$amountPaise,
                'balance_after_paise' => $wallet->balance_paise,
                'reference_type' => $rtype,
                'reference_id' => $rid,
                'idempotency_key' => $idempotencyKey,
                'meta' => $meta,
            ]);
        });
    }

    public function canStart(int $balancePaise, int $ratePerMinPaise, int $minMinutes = 5): bool
    {
        if ($ratePerMinPaise <= 0) {
            return true;
        }

        return $balancePaise >= $ratePerMinPaise * $minMinutes;
    }

    public function minsLeft(int $balancePaise, int $ratePerMinPaise): float
    {
        if ($ratePerMinPaise <= 0) {
            return 999;
        }

        return floor(($balancePaise / $ratePerMinPaise) * 10) / 10;
    }

    public static function newKey(string $prefix): string
    {
        return $prefix.'_'.Str::uuid()->toString();
    }

    /** @return array{0: string|null, 1: int|null} */
    private function morphParts(object|string|null $reference): array
    {
        if (is_object($reference) && method_exists($reference, 'getMorphClass')) {
            return [$reference->getMorphClass(), $reference->getKey()];
        }

        return [null, null];
    }
}
