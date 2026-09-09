<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    protected $fillable = ['code', 'type', 'value_paise', 'min_order_paise', 'max_uses', 'used_count', 'is_active', 'starts_at', 'ends_at', 'meta'];

    protected function casts(): array
    {
        return ['meta' => 'array', 'starts_at' => 'datetime', 'ends_at' => 'datetime', 'is_active' => 'boolean'];
    }

    public function redemptions(): HasMany
    {
        return $this->hasMany(CouponRedemption::class);
    }

    public function isUsable(): bool
    {
        if (! $this->is_active) {
            return false;
        }
        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) {
            return false;
        }
        $now = now();

        return (! $this->starts_at || $now->gte($this->starts_at)) && (! $this->ends_at || $now->lte($this->ends_at));
    }
}
