<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Dispute extends Model
{
    protected $fillable = ['user_id', 'reference_type', 'reference_id', 'subject', 'description', 'status', 'resolution'];

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
