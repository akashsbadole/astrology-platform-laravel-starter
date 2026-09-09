<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $category
 * @property string|null $description
 * @property string|null $benefits
 * @property string|null $vidhi
 * @property array<int, string>|null $samagri
 * @property int $duration_minutes
 * @property string $price
 * @property bool $is_online
 * @property bool $is_active
 */
class Pooja extends Model
{
    protected $fillable = [
        'name', 'category', 'description', 'benefits', 'vidhi', 'samagri',
        'duration_minutes', 'price', 'is_online', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'samagri' => 'array',
            'price' => 'decimal:2',
            'is_online' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(PoojaBooking::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
