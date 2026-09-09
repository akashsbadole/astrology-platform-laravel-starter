<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('astrologer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type')->default('chat'); // chat|call|video|live
            $table->string('status')->default('queued'); // queued|active|ended|cancelled|rejected
            $table->integer('rate_per_min_paise')->default(0);
            $table->timestamp('requested_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->integer('billed_seconds')->default(0);
            $table->bigInteger('amount_paise')->default(0);
            $table->string('end_reason')->nullable(); // completed|low_balance|cancelled|rejected|error
            $table->timestamps();
            $table->index(['astrologer_id', 'status']);
            $table->index(['customer_id', 'status']);
        });

        Schema::create('consultation_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();
            $table->index('consultation_id');
        });

        Schema::create('call_signals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained()->cascadeOnDelete();
            $table->string('provider')->default('reverb'); // reverb|agora|daily
            $table->string('channel');
            $table->text('token')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('call_signals');
        Schema::dropIfExists('consultation_messages');
        Schema::dropIfExists('consultations');
    }
};
