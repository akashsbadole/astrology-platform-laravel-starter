<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LiveParticipant extends Model
{
    protected $table = 'live_participants';

    protected $fillable = ['live_session_id', 'user_id', 'joined_at'];

    protected function casts(): array
    {
        return ['joined_at' => 'datetime'];
    }
}
