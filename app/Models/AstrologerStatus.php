<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AstrologerStatus extends Model
{
    protected $fillable = ['user_id', 'is_online', 'accepts_chat', 'accepts_call', 'accepts_video', 'last_seen_at'];

    protected function casts(): array
    {
        return ['is_online' => 'boolean', 'accepts_chat' => 'boolean', 'accepts_call' => 'boolean', 'accepts_video' => 'boolean', 'last_seen_at' => 'datetime'];
    }
}
