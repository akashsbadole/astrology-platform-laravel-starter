<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = ['user_id', 'status', 'subtotal_paise', 'discount_paise', 'total_paise', 'razorpay_order_id', 'razorpay_payment_id', 'address', 'shipping_status', 'tracking_number', 'carrier', 'shipped_at', 'delivered_at'];

    protected function casts(): array
    {
        return ['address' => 'array', 'shipped_at' => 'datetime', 'delivered_at' => 'datetime'];
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
