<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Pooja;
use App\Models\PoojaBooking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PoojaBookingController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $bookings = $request->user()
            ->poojaBookings()
            ->with('pooja:id,name')
            ->latest('scheduled_date')
            ->paginate(10)
            ->through(fn (PoojaBooking $booking) => [
                'id' => $booking->id,
                'pooja_name' => $booking->pooja->name,
                'scheduled_date' => $booking->scheduled_date->toDateString(),
                'amount' => $booking->amount,
                'status' => $booking->status,
                'payment_status' => $booking->payment_status,
            ]);

        if ($request->wantsJson()) {
            return response()->json([
                'data' => $bookings->items(),
                'total' => $bookings->total(),
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
            ]);
        }

        return Inertia::render('customer/pooja-bookings/index', [
            'bookings' => $bookings,
        ]);
    }

    public function store(Request $request, Pooja $pooja): RedirectResponse|JsonResponse
    {
        abort_unless($pooja->is_active, 404);

        $validated = $request->validate([
            'scheduled_date' => ['required', 'date', 'after_or_equal:today'],
            'customer_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $booking = $request->user()->poojaBookings()->create([
            'pooja_id' => $pooja->id,
            'scheduled_date' => $validated['scheduled_date'],
            'amount' => $pooja->price,
            'customer_notes' => $validated['customer_notes'] ?? null,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['ok' => true, 'booking' => [
                'id' => $booking->id,
                'pooja_name' => $pooja->name,
                'scheduled_date' => $booking->scheduled_date->toDateString(),
                'amount' => $booking->amount,
                'status' => $booking->status,
            ]]);
        }

        return redirect()->route('customer.pooja-bookings.checkout', $booking);
    }

    public function checkout(Request $request, PoojaBooking $poojaBooking): Response|JsonResponse
    {
        abort_unless($poojaBooking->customer_id === $request->user()->id, 403);

        $poojaBooking->load('pooja:id,name');

        $payload = [
            'booking' => [
                'id' => $poojaBooking->id,
                'pooja_name' => $poojaBooking->pooja->name,
                'scheduled_date' => $poojaBooking->scheduled_date->toDateString(),
                'amount' => $poojaBooking->amount,
                'status' => $poojaBooking->status,
            ],
            'razorpayKeyId' => config('services.razorpay.key_id'),
        ];

        if ($request->wantsJson()) {
            return response()->json($payload);
        }

        return Inertia::render('customer/pooja-bookings/checkout', $payload);
    }
}
