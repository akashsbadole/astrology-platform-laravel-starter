<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CallSignal extends Model
{
    protected $table = 'call_signals';

    protected $fillable = ['consultation_id', 'provider', 'channel', 'token', 'payload'];

    protected function casts(): array
    {
        return ['payload' => 'array'];
    }

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }
}
