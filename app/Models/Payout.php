<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payout extends Model
{
    protected $fillable = ['astrologer_id', 'amount_paise', 'status', 'utr'];
}
