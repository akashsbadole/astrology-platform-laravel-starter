<?php

namespace App\Events;

use App\Models\ConsultationMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class ConsultationMessageSent implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public function __construct(public ConsultationMessage $message) {}

    /** @return array<int, Channel> */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('consultation.'.$this->message->consultation_id)];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'consultation_id' => $this->message->consultation_id,
            'sender_id' => $this->message->sender_id,
            'sender_name' => $this->message->sender->name,
            'body' => $this->message->body,
            'created_at' => $this->message->created_at->toIso8601String(),
        ];
    }
}
