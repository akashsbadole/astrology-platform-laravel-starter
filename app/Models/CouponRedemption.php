<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class CouponRedemption extends Model
{
    protected $fillable = ['coupon_id', 'user_id', 'reference_type', 'reference_id'];

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
