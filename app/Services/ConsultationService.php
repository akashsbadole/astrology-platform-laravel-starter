<?php

namespace App\Services;

use App\Events\ConsultationEnded;
use App\Events\ConsultationTick;
use App\Events\ConsultationUpdated;
use App\Models\AstrologerEarning;
use App\Models\Consultation;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ConsultationService
{
    public const MIN_START_MINUTES = 5;

    public const TICK_SECONDS = 30;

    public const LOW_BALANCE_MINUTES = 2;

    public const COMMISSION_RATE = 0.25;

    public function __construct(private readonly WalletService $wallets) {}

    public function rateFor(User $astrologer, string $type): int
    {
        $profile = $astrologer->astrologerProfile;
        if (! $profile) {
            return 0;
        }
        $col = match ($type) {
            'call' => $profile->rate_call_per_min,
            'video', 'live' => $profile->rate_video_per_min,
            default => $profile->rate_chat_per_min,
        };

        return (int) round((float) $col * 100);
    }

    public function request(User $customer, User $astrologer, string $type, ?int $bookingId = null): Consultation
    {
        abort_unless(in_array($type, ['chat', 'call', 'video'], true), 422);
        abort_if($customer->id === $astrologer->id, 422);
        abort_unless($astrologer->astrologerProfile?->status === 'approved', 422, 'Astrologer unavailable.');

        $busy = Consultation::where(function ($q) use ($customer, $astrologer) {
            $q->where('customer_id', $customer->id)->orWhere('astrologer_id', $astrologer->id);
        })->whereIn('status', ['queued', 'active'])->exists();
        abort_if($busy, 422, 'You already have an active session. End it first.');

        $rate = $this->rateFor($astrologer, $type);
        abort_if($rate <= 0, 422, 'Astrologer has no rate for '.$type.'.');

        // First-free coupon: allow 5 free minutes once per astrologer (tracked via meta, no debit until 300s)
        $balance = $this->wallets->balancePaise($customer);
        abort_unless($this->wallets->canStart($balance, $rate, self::MIN_START_MINUTES), 422, 'Low balance. Recharge for at least '.self::MIN_START_MINUTES.' minutes (₹'.number_format($rate * self::MIN_START_MINUTES / 100, 2).').');

        $c = Consultation::create([
            'customer_id' => $customer->id,
            'astrologer_id' => $astrologer->id,
            'booking_id' => $bookingId,
            'type' => $type,
            'status' => 'queued',
            'rate_per_min_paise' => $rate,
            'requested_at' => now(),
        ]);

        broadcast(new ConsultationUpdated($c->fresh()))->toOthers();

        return $c;
    }

    public function accept(User $astrologer, Consultation $c): Consultation
    {
        abort_unless($c->astrologer_id === $astrologer->id, 403);
        abort_unless($c->status === 'queued', 422);
        $c->update(['status' => 'active', 'started_at' => now()]);
        broadcast(new ConsultationUpdated($c->fresh()))->toOthers();

        return $c->fresh();
    }

    public function heartbeat(User $user, Consultation $c, int $seconds): array
    {
        abort_unless(in_array($user->id, [$c->customer_id, $c->astrologer_id], true), 403);
        abort_unless($c->status === 'active', 422, 'Session not active.');

        $seconds = max(5, min(120, $seconds));
        $perSec = $c->rate_per_min_paise / 60;
        $charge = (int) round($perSec * $seconds);

        $customer = $c->customer;
        $balance = $this->wallets->balancePaise($customer);

        if ($balance <= 0 || $balance < $charge) {
            return $this->end($c, 'low_balance');
        }

        $this->wallets->debit($customer, $charge, WalletService::newKey('tick-'.$c->id.'-'.$c->billed_seconds.'-'.$seconds), $c, 'debit', ['seconds' => $seconds]);

        $c->increment('billed_seconds', $seconds);
        $c->increment('amount_paise', $charge);
        $c = $c->fresh();

        $left = $this->wallets->balancePaise($customer);
        $minsLeft = $this->wallets->minsLeft($left, $c->rate_per_min_paise);

        broadcast(new ConsultationTick($c, $left, $minsLeft))->toOthers();

        if ($minsLeft <= 0) {
            return $this->end($c->fresh(), 'low_balance');
        }

        return ['consultation' => $c->fresh(), 'balance_paise' => $left, 'mins_left' => $minsLeft, 'low' => $minsLeft <= self::LOW_BALANCE_MINUTES];
    }

    /** @return array{consultation: Consultation, balance_paise: int, mins_left: float, low: bool, ended: bool} */
    public function end(Consultation $c, string $reason = 'completed'): array
    {
        return DB::transaction(function () use ($c, $reason) {
            $c = Consultation::where('id', $c->id)->lockForUpdate()->first();
            if ($c->status === 'ended') {
                $left = $this->wallets->balancePaise($c->customer);

                return ['consultation' => $c, 'balance_paise' => $left, 'mins_left' => 0, 'low' => true, 'ended' => true];
            }
            $c->update(['status' => 'ended', 'ended_at' => now(), 'end_reason' => $reason]);
            // Split
            $gross = (int) $c->amount_paise;
            $commission = (int) round($gross * self::COMMISSION_RATE);
            AstrologerEarning::create([
                'astrologer_id' => $c->astrologer_id,
                'reference_type' => Consultation::class,
                'reference_id' => $c->id,
                'gross_paise' => $gross,
                'commission_paise' => $commission,
                'net_paise' => $gross - $commission,
                'status' => 'payable',
            ]);
            broadcast(new ConsultationEnded($c->fresh()))->toOthers();
            $left = $this->wallets->balancePaise($c->customer);

            return ['consultation' => $c->fresh(), 'balance_paise' => $left, 'mins_left' => 0, 'low' => true, 'ended' => true];
        });
    }
}
