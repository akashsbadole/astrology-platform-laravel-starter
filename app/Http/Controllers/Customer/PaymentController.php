<?php

namespace App\Http\Controllers\Customer;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Notifications\BookingConfirmed;
use App\Services\RazorpayService;
use App\Services\ReferralService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(private readonly RazorpayService $razorpay) {}

    public function createOrder(Request $request, Booking $booking): JsonResponse
    {
        abort_unless($booking->customer_id === $request->user()->id, 403);
        abort_unless($booking->status === BookingStatus::PendingPayment, 422, 'This booking is no longer awaiting payment.');

        $order = $this->razorpay->createOrder(
            amount: (float) $booking->amount,
            receipt: 'booking-'.$booking->id,
        );

        $booking->update(['razorpay_order_id' => $order['id']]);

        return response()->json([
            'order_id' => $order['id'],
            'amount' => $order['amount'],
            'currency' => $order['currency'],
            'key_id' => config('services.razorpay.key_id'),
        ]);
    }

    public function verify(Request $request, Booking $booking): RedirectResponse|JsonResponse
    {
        abort_unless($booking->customer_id === $request->user()->id, 403);

        $validated = $request->validate([
            'razorpay_order_id' => ['required', 'string'],
            'razorpay_payment_id' => ['required', 'string'],
            'razorpay_signature' => ['required', 'string'],
        ]);

        if ($validated['razorpay_order_id'] !== $booking->razorpay_order_id) {
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
                ->route('customer.bookings.checkout', $booking)
                ->with('error', 'Payment verification failed. Please try again.');
        }

        $booking->update([
            'status' => BookingStatus::Confirmed,
            'payment_status' => PaymentStatus::Paid,
            'razorpay_payment_id' => $validated['razorpay_payment_id'],
        ]);

        $booking->loadMissing(['customer', 'astrologer']);
        $booking->customer->notify(new BookingConfirmed($booking, forAstrologer: false));
        $booking->astrologer->notify(new BookingConfirmed($booking, forAstrologer: true));

        app(ReferralService::class)->awardForPaidBooking(
            $booking->customer, (string) $booking->amount, $booking, 'booking'
        );

        if ($request->wantsJson()) {
            return response()->json(['ok' => true, 'status' => 'confirmed']);
        }

        return redirect()
            ->route('customer.bookings.index')
            ->with('status', 'booking-confirmed');
    }
}
