<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = ['slot', 'title', 'image', 'link', 'is_active', 'sort'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }
}
