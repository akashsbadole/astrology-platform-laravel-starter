<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Shipment extends Model
{
    protected $fillable = ['order_id', 'status', 'carrier', 'tracking_number', 'note'];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
