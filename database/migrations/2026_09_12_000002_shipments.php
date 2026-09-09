<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_status')->default('pending')->after('status'); // pending|packed|shipped|in_transit|delivered|cancelled
            $table->string('tracking_number')->nullable()->after('shipping_status');
            $table->string('carrier')->nullable()->after('tracking_number');
            $table->timestamp('shipped_at')->nullable()->after('carrier');
            $table->timestamp('delivered_at')->nullable()->after('shipped_at');
        });

        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('status'); // packed|shipped|in_transit|delivered|cancelled
            $table->string('carrier')->nullable();
            $table->string('tracking_number')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_status', 'tracking_number', 'carrier', 'shipped_at', 'delivered_at']);
        });
    }
};
