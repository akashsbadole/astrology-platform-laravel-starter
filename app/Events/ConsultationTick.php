<?php

namespace App\Events;

use App\Models\Consultation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class ConsultationTick implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public function __construct(public Consultation $consultation, public int $balancePaise, public float $minsLeft) {}

    /** @return array<int, Channel> */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('consultation.'.$this->consultation->id)];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->consultation->id,
            'billed_seconds' => $this->consultation->billed_seconds,
            'amount_paise' => $this->consultation->amount_paise,
            'balance_paise' => $this->balancePaise,
            'mins_left' => $this->minsLeft,
        ];
    }
}
