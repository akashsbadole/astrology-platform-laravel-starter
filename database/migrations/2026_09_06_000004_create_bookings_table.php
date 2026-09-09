<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('astrologer_id')->constrained('users')->cascadeOnDelete();
            $table->string('consultation_type'); // chat | call | video
            $table->dateTime('scheduled_at');
            $table->unsignedSmallInteger('duration_minutes');
            $table->decimal('rate_per_min', 8, 2);
            $table->decimal('amount', 10, 2);
            $table->string('status')->default('pending_payment'); // pending_payment | confirmed | completed | cancelled
            $table->string('payment_status')->default('unpaid'); // unpaid | paid | refunded
            $table->string('razorpay_order_id')->nullable();
            $table->string('razorpay_payment_id')->nullable();
            $table->text('customer_notes')->nullable();
            $table->timestamps();

            $table->index(['astrologer_id', 'scheduled_at']);
            $table->index('customer_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
