<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Booking;
use App\Models\Message;
use App\Notifications\ChatMessageReceived;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function show(Request $request, Booking $booking): Response
    {
        $this->authorizeParty($request, $booking);

        $booking->load(['customer:id,name', 'astrologer:id,name']);

        $messages = $booking->messages()
            ->with('sender:id,name')
            ->oldest()
            ->get()
            ->map(fn (Message $message) => $this->present($message));

        $otherParty = $request->user()->id === $booking->customer_id
            ? $booking->astrologer
            : $booking->customer;

        return Inertia::render('chat/show', [
            'booking' => [
                'id' => $booking->id,
                'status' => $booking->status->value,
                'scheduled_at' => $booking->scheduled_at->toIso8601String(),
                'duration_minutes' => $booking->duration_minutes,
                'ends_at' => $booking->endsAt()->toIso8601String(),
                'is_session_active' => $booking->isSessionActive(),
                'other_party_name' => $otherParty->name,
            ],
            'messages' => $messages,
            'currentUserId' => $request->user()->id,
        ]);
    }

    public function store(Request $request, Booking $booking): RedirectResponse|JsonResponse
    {
        $this->authorizeParty($request, $booking);

        abort_unless($booking->isSessionActive(), 422, 'This chat is only available during the scheduled session.');

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $message = $booking->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        $message->load('sender:id,name');

        broadcast(new MessageSent($message))->toOthers();

        $booking->loadMissing(['customer:id,name', 'astrologer:id,name']);
        $other = $request->user()->id === $booking->customer_id ? $booking->astrologer : $booking->customer;
        $other->notify(new ChatMessageReceived(
            $request->user()->name,
            $validated['body'],
            '/bookings/'.$booking->id.'/chat'
        ));

        if ($request->wantsJson()) {
            return response()->json($this->present($message));
        }

        return back();
    }

    private function authorizeParty(Request $request, Booking $booking): void
    {
        abort_unless(
            in_array($request->user()->id, [$booking->customer_id, $booking->astrologer_id], true),
            403,
        );
    }

    private function present(Message $message): array
    {
        return [
            'id' => $message->id,
            'booking_id' => $message->booking_id,
            'sender_id' => $message->sender_id,
            'sender_name' => $message->sender->name,
            'body' => $message->body,
            'created_at' => $message->created_at->toIso8601String(),
        ];
    }
}
