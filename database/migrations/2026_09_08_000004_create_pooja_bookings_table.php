<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pooja_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('pooja_id')->constrained()->cascadeOnDelete();
            $table->date('scheduled_date');
            $table->decimal('amount', 10, 2);
            $table->string('status')->default('pending_payment'); // pending_payment | confirmed | completed | cancelled
            $table->string('payment_status')->default('unpaid'); // unpaid | paid | refunded
            $table->string('razorpay_order_id')->nullable();
            $table->string('razorpay_payment_id')->nullable();
            $table->text('customer_notes')->nullable();
            $table->timestamps();

            $table->index('customer_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pooja_bookings');
    }
};
