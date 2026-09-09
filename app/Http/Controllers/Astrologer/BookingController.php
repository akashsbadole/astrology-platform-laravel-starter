<?php

namespace App\Http\Controllers\Astrologer;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Notifications\BookingCancelled;
use App\Services\RazorpayService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function __construct(private readonly RazorpayService $razorpay) {}

    public function index(Request $request): Response
    {
        $bookings = $request->user()
            ->bookingsAsAstrologer()
            ->with('customer:id,name')
            ->latest('scheduled_at')
            ->paginate(10)
            ->through(fn (Booking $booking) => [
                'id' => $booking->id,
                'customer_name' => $booking->customer->name,
                'consultation_type' => $booking->consultation_type->value,
                'scheduled_at' => $booking->scheduled_at->toIso8601String(),
                'duration_minutes' => $booking->duration_minutes,
                'amount' => $booking->amount,
                'status' => $booking->status->value,
                'payment_status' => $booking->payment_status->value,
                'is_session_active' => $booking->isSessionActive(),
                'customer_notes' => $booking->customer_notes,
            ]);

        return Inertia::render('astrologer/bookings/index', [
            'bookings' => $bookings,
        ]);
    }

    public function complete(Request $request, Booking $booking): RedirectResponse
    {
        abort_unless($booking->astrologer_id === $request->user()->id, 403);
        abort_unless($booking->status === BookingStatus::Confirmed, 422, 'Only confirmed bookings can be completed.');

        $booking->update(['status' => BookingStatus::Completed]);

        return back()->with('status', 'booking-completed');
    }

    public function cancel(Request $request, Booking $booking): RedirectResponse
    {
        abort_unless($booking->astrologer_id === $request->user()->id, 403);
        abort_unless(
            in_array($booking->status, [BookingStatus::PendingPayment, BookingStatus::Confirmed], true),
            422,
            'This booking can no longer be cancelled.'
        );

        $wasPaid = $booking->payment_status === PaymentStatus::Paid;

        if ($wasPaid && $booking->razorpay_payment_id) {
            try {
                $this->razorpay->refund($booking->razorpay_payment_id, (float) $booking->amount);
            } catch (\Throwable $e) {
                Log::error('Razorpay refund failed for booking '.$booking->id.': '.$e->getMessage());
            }
        }

        $booking->update([
            'status' => BookingStatus::Cancelled,
            'payment_status' => $wasPaid ? PaymentStatus::Refunded : $booking->payment_status,
        ]);

        $booking->loadMissing('customer');
        $booking->customer->notify(new BookingCancelled($booking));

        return back()->with('status', 'booking-cancelled');
    }
}
