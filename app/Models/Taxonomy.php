<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $type
 * @property string $name
 * @property bool $is_active
 */
class Taxonomy extends Model
{
    protected $fillable = ['type', 'name', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    /**
     * @return array<int, string>
     */
    public static function activeNames(string $type): array
    {
        return static::query()->ofType($type)->active()->orderBy('name')->pluck('name')->all();
    }
}
