<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LiveGift extends Model
{
    protected $table = 'live_gifts';

    protected $fillable = ['live_session_id', 'sender_id', 'gift', 'amount_paise'];
}
