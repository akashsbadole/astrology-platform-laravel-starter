<?php

namespace App\Http\Controllers;

use App\Events\PoojaMessageSent;
use App\Models\PoojaBooking;
use App\Models\PoojaMessage;
use App\Models\User;
use App\Notifications\ChatMessageReceived;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PoojaChatController extends Controller
{
    public function show(Request $request, PoojaBooking $poojaBooking): Response
    {
        $this->authorizeParty($request, $poojaBooking);

        $poojaBooking->load(['pooja:id,name', 'customer:id,name']);

        $messages = $poojaBooking->messages()
            ->with('sender:id,name')
            ->oldest()
            ->get()
            ->map(fn (PoojaMessage $m) => $this->present($m));

        return Inertia::render('pooja-chat/show', [
            'booking' => [
                'id' => $poojaBooking->id,
                'pooja_name' => $poojaBooking->pooja->name,
                'scheduled_date' => $poojaBooking->scheduled_date->toDateString(),
                'status' => $poojaBooking->status,
                'is_chat_active' => $poojaBooking->isChatActive(),
            ],
            'chatUrl' => $request->user()->role->value === 'admin'
                ? "/admin/pooja-bookings/{$poojaBooking->id}/chat"
                : "/customer/pooja-bookings/{$poojaBooking->id}/chat",
            'messages' => $messages,
            'currentUserId' => $request->user()->id,
        ]);
    }

    public function store(Request $request, PoojaBooking $poojaBooking): RedirectResponse|JsonResponse
    {
        $this->authorizeParty($request, $poojaBooking);

        abort_unless($poojaBooking->isChatActive(), 422, 'Support chat is only available for confirmed pooja bookings.');

        $validated = $request->validate(['body' => ['required', 'string', 'max:2000']]);

        $message = $poojaBooking->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);
        $message->load('sender:id,name');

        broadcast(new PoojaMessageSent($message))->toOthers();

        // Notify the other side (customer gets admin/support reply and vice versa).
        // For poojas the "other party" is support: notify customer when an admin replies,
        // and notify all admins when the customer writes.
        if ($request->user()->id === $poojaBooking->customer_id) {
            foreach (User::where('role', 'admin')->get() as $admin) {
                $admin->notify(new ChatMessageReceived(
                    $request->user()->name,
                    $validated['body'],
                    '/admin/pooja-bookings/'.$poojaBooking->id.'/chat'
                ));
            }
        } else {
            $poojaBooking->customer->notify(new ChatMessageReceived(
                $request->user()->name,
                $validated['body'],
                '/customer/pooja-bookings/'.$poojaBooking->id.'/chat'
            ));
        }

        if ($request->wantsJson()) {
            return response()->json($this->present($message));
        }

        return back();
    }

    private function authorizeParty(Request $request, PoojaBooking $poojaBooking): void
    {
        $user = $request->user();

        abort_unless(
            $user->id === $poojaBooking->customer_id || $user->role->value === 'admin',
            403
        );
    }

    private function present(PoojaMessage $message): array
    {
        return [
            'id' => $message->id,
            'pooja_booking_id' => $message->pooja_booking_id,
            'sender_id' => $message->sender_id,
            'sender_name' => $message->sender->name,
            'body' => $message->body,
            'created_at' => $message->created_at->toIso8601String(),
        ];
    }
}
