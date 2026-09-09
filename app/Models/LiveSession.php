<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LiveSession extends Model
{
    protected $fillable = ['astrologer_id', 'title', 'description', 'status', 'starts_at', 'ended_at', 'entry_fee_paise', 'room_id'];

    protected function casts(): array
    {
        return ['starts_at' => 'datetime', 'ended_at' => 'datetime'];
    }

    public function astrologer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'astrologer_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(LiveParticipant::class);
    }

    public function gifts(): HasMany
    {
        return $this->hasMany(LiveGift::class);
    }
}
