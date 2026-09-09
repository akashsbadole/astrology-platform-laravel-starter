<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsultationEvent extends Model
{
    protected $fillable = ['consultation_id', 'actor_id', 'kind', 'meta'];

    protected function casts(): array
    {
        return ['meta' => 'array'];
    }

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }
}
