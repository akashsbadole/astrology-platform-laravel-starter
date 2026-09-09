<?php

namespace App\Events;

use App\Models\Consultation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class ConsultationUpdated implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public function __construct(public Consultation $consultation) {}

    /** @return array<int, Channel> */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('consultation.'.$this->consultation->id),
            new PrivateChannel('App.Models.User.'.$this->consultation->customer_id),
            new PrivateChannel('App.Models.User.'.$this->consultation->astrologer_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->consultation->id,
            'status' => $this->consultation->status,
            'type' => $this->consultation->type,
            'started_at' => $this->consultation->started_at?->toIso8601String(),
            'billed_seconds' => $this->consultation->billed_seconds,
            'amount_paise' => $this->consultation->amount_paise,
        ];
    }
}
