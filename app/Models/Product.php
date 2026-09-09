<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = ['slug', 'name', 'sku', 'description', 'price_paise', 'mrp_paise', 'stock', 'images', 'is_active'];

    protected function casts(): array
    {
        return ['images' => 'array', 'is_active' => 'boolean'];
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
