<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CallRecording extends Model
{
    protected $fillable = ['consultation_id', 'user_id', 'path', 'disk', 'mime', 'size_bytes', 'duration_seconds', 'status'];

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }
}
