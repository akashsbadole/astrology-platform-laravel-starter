<?php

namespace App\Models;

use Database\Factories\AstrologerProfileFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string|null $bio
 * @property array<int, string>|null $specializations
 * @property array<int, string>|null $languages
 * @property int $experience_years
 * @property string|null $rate_chat_per_min
 * @property string|null $rate_call_per_min
 * @property string|null $rate_video_per_min
 * @property string $status
 * @property string|null $rejection_reason
 * @property string $rating_avg
 * @property int $rating_count
 * @property Carbon|null $approved_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 */
class AstrologerProfile extends Model
{
    /** @use HasFactory<AstrologerProfileFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bio',
        'specializations',
        'languages',
        'experience_years',
        'rate_chat_per_min',
        'rate_call_per_min',
        'rate_video_per_min',
        'status',
        'rejection_reason',
        'rating_avg',
        'rating_count',
        'approved_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'specializations' => 'array',
            'languages' => 'array',
            'rate_chat_per_min' => 'decimal:2',
            'rate_call_per_min' => 'decimal:2',
            'rate_video_per_min' => 'decimal:2',
            'rating_avg' => 'decimal:2',
            'approved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'astrologer_id', 'user_id');
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', 'approved');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }
}
