<?php

namespace App\Models;

use App\Services\Astrology\VedicReference;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $profile_name
 * @property string|null $gender
 * @property Carbon $date_of_birth
 * @property string $time_of_birth
 * @property string $birth_place
 * @property string $latitude
 * @property string $longitude
 * @property string $utc_offset_hours
 * @property string $ayanamsa
 * @property string $ascendant_longitude
 * @property array<string, float> $planets
 * @property-read User $user
 */
class Kundli extends Model
{
    protected $fillable = [
        'user_id',
        'profile_name',
        'gender',
        'date_of_birth',
        'time_of_birth',
        'birth_place',
        'latitude',
        'longitude',
        'utc_offset_hours',
        'ayanamsa',
        'ascendant_longitude',
        'planets',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'latitude' => 'decimal:6',
            'longitude' => 'decimal:6',
            'utc_offset_hours' => 'decimal:2',
            'ayanamsa' => 'decimal:5',
            'ascendant_longitude' => 'decimal:5',
            'planets' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function moonSiderealLongitude(): float
    {
        return (float) $this->planets['moon'];
    }

    /**
     * Full placement summary for every body, keyed by planet name.
     *
     * @return array<string, array{longitude: float, rashi: string, nakshatra: string, pada: int, house: int}>
     */
    public function placements(): array
    {
        $ascendantRashi = VedicReference::rashiIndex((float) $this->ascendant_longitude);

        $placements = [];
        foreach ($this->planets as $planet => $longitude) {
            $rashiIndex = VedicReference::rashiIndex($longitude);
            $placements[$planet] = [
                'longitude' => round($longitude, 4),
                'rashi' => VedicReference::rashiName($longitude),
                'rashi_index' => $rashiIndex,
                'nakshatra' => VedicReference::nakshatraName($longitude),
                'pada' => VedicReference::nakshatraPada($longitude),
                // Whole-sign houses: house = rashi offset from the ascendant's rashi, 1-12.
                'house' => (($rashiIndex - $ascendantRashi + 12) % 12) + 1,
            ];
        }

        return $placements;
    }

    public function ascendantRashiIndex(): int
    {
        return VedicReference::rashiIndex((float) $this->ascendant_longitude);
    }

    public function ascendantRashi(): string
    {
        return VedicReference::rashiName((float) $this->ascendant_longitude);
    }
}
