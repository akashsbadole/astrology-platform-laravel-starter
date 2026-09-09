<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LiveMessage extends Model
{
    protected $fillable = ['live_session_id', 'sender_id', 'body'];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
