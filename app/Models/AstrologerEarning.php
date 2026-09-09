<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AstrologerEarning extends Model
{
    protected $fillable = ['astrologer_id', 'reference_type', 'reference_id', 'gross_paise', 'commission_paise', 'net_paise', 'status'];

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
