<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $booking_id
 * @property int $customer_id
 * @property int $astrologer_id
 * @property int $rating
 * @property string|null $comment
 * @property-read Booking $booking
 * @property-read User $customer
 * @property-read User $astrologer
 */
class Review extends Model
{
    protected $fillable = [
        'booking_id',
        'customer_id',
        'astrologer_id',
        'rating',
        'comment',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function astrologer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'astrologer_id');
    }
}
