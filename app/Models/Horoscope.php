<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Horoscope extends Model
{
    protected $fillable = ['rashi', 'period', 'date', 'title', 'body', 'lucky_color', 'lucky_number', 'lucky_time'];

    protected function casts(): array
    {
        return ['date' => 'date'];
    }
}
