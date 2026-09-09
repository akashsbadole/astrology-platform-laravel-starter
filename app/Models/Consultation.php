<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Consultation extends Model
{
    protected $fillable = [
        'customer_id', 'astrologer_id', 'booking_id', 'type', 'status',
        'rate_per_min_paise', 'requested_at', 'started_at', 'ended_at',
        'billed_seconds', 'amount_paise', 'end_reason',
    ];

    protected function casts(): array
    {
        return [
            'requested_at' => 'datetime',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function astrologer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'astrologer_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ConsultationMessage::class);
    }

    public function signal(): HasOne
    {
        return $this->hasOne(CallSignal::class);
    }

    public function rateRupees(): float
    {
        return $this->rate_per_min_paise / 100;
    }

    public function minsLeft(int $balancePaise): float
    {
        if ($this->rate_per_min_paise <= 0) {
            return 999;
        }

        return $balancePaise / $this->rate_per_min_paise;
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
