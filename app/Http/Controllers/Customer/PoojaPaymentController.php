<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\PoojaBooking;
use App\Notifications\PoojaBookingConfirmed;
use App\Services\RazorpayService;
use App\Services\ReferralService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PoojaPaymentController extends Controller
{
    public function __construct(private readonly RazorpayService $razorpay) {}

    public function createOrder(Request $request, PoojaBooking $poojaBooking): JsonResponse
    {
        abort_unless($poojaBooking->customer_id === $request->user()->id, 403);
        abort_unless($poojaBooking->status === 'pending_payment', 422, 'This booking is no longer awaiting payment.');

        $order = $this->razorpay->createOrder(
            amount: (float) $poojaBooking->amount,
            receipt: 'pooja-booking-'.$poojaBooking->id,
        );

        $poojaBooking->update(['razorpay_order_id' => $order['id']]);

        return response()->json([
            'order_id' => $order['id'],
            'amount' => $order['amount'],
            'currency' => $order['currency'],
            'key_id' => config('services.razorpay.key_id'),
        ]);
    }

    public function verify(Request $request, PoojaBooking $poojaBooking): RedirectResponse|JsonResponse
    {
        abort_unless($poojaBooking->customer_id === $request->user()->id, 403);

        $validated = $request->validate([
            'razorpay_order_id' => ['required', 'string'],
            'razorpay_payment_id' => ['required', 'string'],
            'razorpay_signature' => ['required', 'string'],
        ]);

        if ($validated['razorpay_order_id'] !== $poojaBooking->razorpay_order_id) {
            abort(422, 'Order mismatch.');
        }

        $verified = $this->razorpay->verifySignature(
            $validated['razorpay_order_id'],
            $validated['razorpay_payment_id'],
            $validated['razorpay_signature'],
        );

        if (! $verified) {
            if ($request->wantsJson()) {
                return response()->json(['ok' => false, 'error' => 'Payment verification failed.'], 422);
            }

            return redirect()
                ->route('customer.pooja-bookings.checkout', $poojaBooking)
                ->with('error', 'Payment verification failed. Please try again.');
        }

        $poojaBooking->update([
            'status' => 'confirmed',
            'payment_status' => 'paid',
            'razorpay_payment_id' => $validated['razorpay_payment_id'],
        ]);

        $poojaBooking->loadMissing(['customer', 'pooja']);
        $poojaBooking->customer->notify(new PoojaBookingConfirmed($poojaBooking));
        app(ReferralService::class)->awardForPaidBooking(
            $poojaBooking->customer, (string) $poojaBooking->amount, $poojaBooking, 'pooja booking'
        );

        if ($request->wantsJson()) {
            return response()->json(['ok' => true, 'status' => 'confirmed']);
        }

        return redirect()
            ->route('customer.pooja-bookings.index')
            ->with('status', 'pooja-booking-confirmed');
    }
}
