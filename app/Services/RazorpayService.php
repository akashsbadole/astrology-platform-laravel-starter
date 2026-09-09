<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class RazorpayService
{
    private const BASE_URL = 'https://api.razorpay.com/v1';

    public function __construct(
        private readonly ?string $keyId = null,
        private readonly ?string $keySecret = null,
    ) {
        $this->keyId ??= config('services.razorpay.key_id');
        $this->keySecret ??= config('services.razorpay.key_secret');
    }

    /**
     * Create a Razorpay order. Amount must be in the base currency unit
     * (e.g. rupees); this converts to paise as Razorpay requires.
     *
     * @return array{id: string, amount: int, currency: string}
     */
    public function createOrder(float $amount, string $receipt, string $currency = 'INR'): array
    {
        $this->ensureConfigured();

        $response = Http::withBasicAuth($this->keyId, $this->keySecret)
            ->asJson()
            ->post(self::BASE_URL.'/orders', [
                'amount' => (int) round($amount * 100),
                'currency' => $currency,
                'receipt' => $receipt,
                'payment_capture' => 1,
            ]);

        if ($response->failed()) {
            throw new RuntimeException('Razorpay order creation failed: '.$response->body());
        }

        return $response->json();
    }

    /**
     * Verify the signature Razorpay's checkout returns after a successful payment.
     * See: https://razorpay.com/docs/payments/server-integration/php/payment-gateway/build-integration/#3-verify-payment-signature
     */
    public function verifySignature(string $orderId, string $paymentId, string $signature): bool
    {
        $this->ensureConfigured();

        $expected = hash_hmac('sha256', $orderId.'|'.$paymentId, $this->keySecret);

        return hash_equals($expected, $signature);
    }

    /**
     * Issue a full or partial refund for a captured payment.
     *
     * @return array<string, mixed>
     */
    public function refund(string $paymentId, ?float $amount = null): array
    {
        $this->ensureConfigured();

        $payload = $amount !== null ? ['amount' => (int) round($amount * 100)] : [];

        $response = Http::withBasicAuth($this->keyId, $this->keySecret)
            ->asJson()
            ->post(self::BASE_URL."/payments/{$paymentId}/refund", $payload);

        if ($response->failed()) {
            throw new RuntimeException('Razorpay refund failed: '.$response->body());
        }

        return $response->json();
    }

    private function ensureConfigured(): void
    {
        if (! $this->keyId || ! $this->keySecret) {
            throw new RuntimeException(
                'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.'
            );
        }
    }
}
