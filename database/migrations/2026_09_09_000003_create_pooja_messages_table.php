<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Pooja support chat (customer <-> support). Kept separate from
        // astrologer consultation messages so existing booking chat is untouched.
        Schema::create('pooja_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pooja_booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();

            $table->index('pooja_booking_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pooja_messages');
    }
};
