<?php

namespace App\Events;

use App\Models\LiveGift;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class LiveGiftSent implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public function __construct(public LiveGift $gift) {}

    /** @return array<int, Channel> */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('live.'.$this->gift->live_session_id)];
    }

    public function broadcastWith(): array
    {
        return ['gift' => $this->gift->gift, 'amount_paise' => $this->gift->amount_paise, 'sender_id' => $this->gift->sender_id];
    }
}
