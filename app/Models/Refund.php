<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Refund extends Model
{
    protected $fillable = ['user_id', 'reference_type', 'reference_id', 'amount_paise', 'reason', 'status'];

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
