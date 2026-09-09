<?php

namespace App\Models;

use App\Enums\BookingStatus;
use App\Enums\ConsultationType;
use App\Enums\PaymentStatus;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $customer_id
 * @property int $astrologer_id
 * @property ConsultationType $consultation_type
 * @property Carbon $scheduled_at
 * @property int $duration_minutes
 * @property string $rate_per_min
 * @property string $amount
 * @property BookingStatus $status
 * @property PaymentStatus $payment_status
 * @property string|null $razorpay_order_id
 * @property string|null $razorpay_payment_id
 * @property string|null $customer_notes
 * @property-read User $customer
 * @property-read User $astrologer
 */
class Booking extends Model
{
    protected $fillable = [
        'customer_id',
        'astrologer_id',
        'consultation_type',
        'scheduled_at',
        'duration_minutes',
        'rate_per_min',
        'amount',
        'status',
        'payment_status',
        'razorpay_order_id',
        'razorpay_payment_id',
        'customer_notes',
    ];

    protected function casts(): array
    {
        return [
            'consultation_type' => ConsultationType::class,
            'scheduled_at' => 'datetime',
            'status' => BookingStatus::class,
            'payment_status' => PaymentStatus::class,
            'rate_per_min' => 'decimal:2',
            'amount' => 'decimal:2',
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
        return $this->hasMany(Message::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function endsAt(): CarbonInterface
    {
        return (clone $this->scheduled_at)->addMinutes($this->duration_minutes);
    }

    /**
     * Whether the session window (confirmed + currently within its time slot) is open.
     * Chat/call/video access is gated on this. Opens 15 min early, closes 30 min late
     * so users can join without exact-clock friction.
     */
    public function isSessionActive(): bool
    {
        if ($this->status !== BookingStatus::Confirmed) {
            return false;
        }

        $now = now();
        $opensAt = (clone $this->scheduled_at)->subMinutes(15);
        $closesAt = (clone $this->endsAt())->addMinutes(30);

        return $now->between($opensAt, $closesAt);
    }

    /**
     * True if a confirmed booking already occupies any part of the given
     * window for this astrologer. Uses a generously bounded candidate query
     * (portable across SQLite/MySQL/Postgres) then checks exact overlap in PHP.
     */
    public static function hasConfirmedOverlap(int $astrologerId, Carbon $start, Carbon $end): bool
    {
        return static::query()
            ->where('astrologer_id', $astrologerId)
            ->where('status', BookingStatus::Confirmed)
            ->where('scheduled_at', '<', $end)
            ->where('scheduled_at', '>', $start->clone()->subHours(6))
            ->get(['scheduled_at', 'duration_minutes'])
            ->contains(function (Booking $booking) use ($start, $end) {
                return $booking->scheduled_at->lt($end) && $booking->endsAt()->gt($start);
            });
    }
}
