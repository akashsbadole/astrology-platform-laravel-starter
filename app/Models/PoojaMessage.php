<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $pooja_booking_id
 * @property int $sender_id
 * @property string $body
 * @property Carbon $created_at
 */
class PoojaMessage extends Model
{
    protected $fillable = ['pooja_booking_id', 'sender_id', 'body'];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(PoojaBooking::class, 'pooja_booking_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
