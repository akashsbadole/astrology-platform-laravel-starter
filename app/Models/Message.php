<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $booking_id
 * @property int $sender_id
 * @property string $body
 * @property Carbon $created_at
 * @property-read Booking $booking
 * @property-read User $sender
 */
class Message extends Model
{
    protected $fillable = [
        'booking_id',
        'sender_id',
        'body',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
