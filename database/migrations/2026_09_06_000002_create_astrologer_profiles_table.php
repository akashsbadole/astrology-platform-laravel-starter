<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('astrologer_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->text('bio')->nullable();
            $table->json('specializations')->nullable();
            $table->json('languages')->nullable();
            $table->unsignedInteger('experience_years')->default(0);
            $table->decimal('rate_chat_per_min', 8, 2)->nullable();
            $table->decimal('rate_call_per_min', 8, 2)->nullable();
            $table->decimal('rate_video_per_min', 8, 2)->nullable();
            $table->string('status')->default('pending'); // pending | approved | rejected
            $table->text('rejection_reason')->nullable();
            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->unsignedInteger('rating_count')->default(0);
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('astrologer_profiles');
    }
};
