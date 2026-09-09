<?php

namespace App\Services;

use App\Models\Payout;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PayoutService
{
    public function process(Payout $payout): Payout
    {
        $keyId = config('services.razorpay.key_id');
        $keySecret = config('services.razorpay.key_secret');
        $account = env('RAZORPAYX_ACCOUNT');

        if (! $keyId || ! $keySecret || ! $account) {
            Log::info('[PAYOUT] (log driver) payout='.$payout->id.' amount_paise='.$payout->amount_paise);
            $payout->update(['status' => 'paid', 'utr' => 'LOG'.time().$payout->id]);

            return $payout->fresh();
        }

        try {
            $response = Http::withBasicAuth($keyId, $keySecret)->asJson()->post(
                'https://api.razorpay.com/v1/payouts',
                [
                    'account_number' => $account,
                    'amount' => $payout->amount_paise,
                    'currency' => 'INR',
                    'mode' => 'UPI',
                    'purpose' => 'payout',
                    'reference_id' => 'payout-'.$payout->id,
                ]
            );
            if ($response->failed()) {
                throw new \RuntimeException($response->body());
            }
            $payout->update(['status' => 'paid', 'utr' => $response->json('utr') ?? $response->json('id')]);
        } catch (\Throwable $e) {
            Log::error('[PAYOUT] failed: '.$e->getMessage());
            $payout->update(['status' => 'approved']);
        }

        return $payout->fresh();
    }
}
