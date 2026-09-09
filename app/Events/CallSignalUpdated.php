<?php

namespace App\Events;

use App\Models\CallSignal;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class CallSignalUpdated implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public function __construct(public CallSignal $signal, public string $kind, public array $data = []) {}

    /** @return array<int, Channel> */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('consultation.'.$this->signal->consultation_id)];
    }

    public function broadcastWith(): array
    {
        return ['kind' => $this->kind, 'channel' => $this->signal->channel, 'data' => $this->data];
    }
}
