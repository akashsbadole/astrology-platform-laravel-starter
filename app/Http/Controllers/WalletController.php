<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Services\RazorpayService;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;

class WalletController extends Controller
{
    public function index(Request $request, WalletService $wallets): Response|JsonResponse
    {
        $user = $request->user();
        $wallet = $wallets->walletFor($user);
        $txns = WalletTransaction::where('user_id', $user->id)->latest()->paginate(20)->through(fn ($t) => [
            'id' => $t->id, 'type' => $t->type, 'amount' => $t->amount_paise / 100,
            'balance_after' => $t->balance_after_paise / 100, 'created_at' => $t->created_at->toIso8601String(),
            'meta' => $t->meta,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'balance' => $wallet->balance_paise / 100,
                'transactions' => $txns,
                'razorpayKeyId' => config('services.razorpay.key_id'),
            ]);
        }

        return Inertia::render('wallet/index', [
            'balance' => $wallet->balance_paise / 100,
            'transactions' => $txns,
            'razorpayKeyId' => config('services.razorpay.key_id'),
        ]);
    }

    public function createOrder(Request $request): JsonResponse
    {
        $v = $request->validate(['amount' => ['required', 'numeric', 'min:10', 'max:100000'], 'coupon' => ['nullable', 'string']]);
        $amount = (float) $v['amount'];
        $discount = 0;
        if (! empty($v['coupon'])) {
            $coupon = Coupon::where('code', strtoupper($v['coupon']))->first();
            if ($coupon?->isUsable()) {
                $discount = $coupon->type === 'percent' ? (int) round($amount * 100 * ($coupon->value_paise / 10000)) : $coupon->value_paise;
                $discount = (int) min($discount, $amount * 100);
            }
        }
        $payable = max(1, $amount - $discount / 100);
        $order = app(RazorpayService::class)->createOrder($payable, 'wallet-'.$request->user()->id.'-'.time());

        return response()->json(['order_id' => $order['id'], 'amount' => $order['amount'], 'currency' => $order['currency'], 'key_id' => config('services.razorpay.key_id'), 'discount_paise' => $discount]);
    }

    public function verify(Request $request, WalletService $wallets): RedirectResponse
    {
        $v = $request->validate(['razorpay_order_id' => 'required|string', 'razorpay_payment_id' => 'required|string', 'razorpay_signature' => 'required|string', 'amount' => 'required|numeric|min:1']);
        $ok = app(RazorpayService::class)->verifySignature($v['razorpay_order_id'], $v['razorpay_payment_id'], $v['razorpay_signature']);
        abort_unless($ok, 422, 'Payment verification failed.');
        $paise = (int) round((float) $v['amount'] * 100);
        $wallets->credit($request->user(), $paise, 'recharge-'.$v['razorpay_payment_id'], null, 'credit', ['order' => $v['razorpay_order_id']]);

        return redirect()->route('wallet.index')->with('status', 'Wallet recharged ₹'.number_format($v['amount'], 2));
    }

    public function webhook(Request $request, WalletService $wallets): JsonResponse
    {
        // Razorpay webhook (payment.captured) — idempotent credit via payment id.
        $payload = $request->all();
        $paymentId = data_get($payload, 'payload.payment.entity.id');
        $amountPaise = (int) data_get($payload, 'payload.payment.entity.amount', 0);
        $email = data_get($payload, 'payload.payment.entity.email');
        if (! $paymentId || $amountPaise <= 0) {
            return response()->json(['ok' => true]);
        }
        $user = $email ? User::where('email', $email)->first() : null;
        if ($user) {
            $wallets->credit($user, $amountPaise, 'recharge-'.$paymentId, null, 'credit', ['webhook' => true]);
        }

        return response()->json(['ok' => true]);
    }
}
