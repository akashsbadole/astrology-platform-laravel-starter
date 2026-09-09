<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $customer_id
 * @property int $pooja_id
 * @property Carbon $scheduled_date
 * @property string $amount
 * @property string $status
 * @property string $payment_status
 * @property string|null $razorpay_order_id
 * @property string|null $razorpay_payment_id
 * @property string|null $customer_notes
 * @property-read User $customer
 * @property-read Pooja $pooja
 */
class PoojaBooking extends Model
{
    protected $fillable = [
        'customer_id', 'pooja_id', 'scheduled_date', 'amount',
        'status', 'payment_status', 'razorpay_order_id', 'razorpay_payment_id', 'customer_notes',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date',
            'amount' => 'decimal:2',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function pooja(): BelongsTo
    {
        return $this->belongsTo(Pooja::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(PoojaMessage::class, 'pooja_booking_id');
    }

    /**
     * Pooja support chat stays open from confirmation until 7 days after
     * the scheduled date so customers can coordinate the ceremony.
     */
    public function isChatActive(): bool
    {
        if (! in_array($this->status, ['confirmed', 'completed'], true)) {
            return false;
        }

        $start = $this->created_at ?? now();
        $end = (clone $this->scheduled_date)->addDays(7)->endOfDay();

        return now()->between($start, $end);
    }
}
