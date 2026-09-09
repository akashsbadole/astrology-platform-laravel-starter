<?php

namespace App\Events;

use App\Models\LiveMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class LiveMessageSent implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public function __construct(public LiveMessage $message) {}

    /** @return array<int, Channel> */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('live.'.$this->message->live_session_id)];
    }

    public function broadcastWith(): array
    {
        return ['id' => $this->message->id, 'sender_name' => $this->message->sender->name, 'body' => $this->message->body];
    }
}
