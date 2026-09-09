<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('astrologer_profiles', function (Blueprint $table) {
            $table->boolean('is_online')->default(false)->after('status');
            $table->boolean('accepts_chat')->default(true)->after('is_online');
            $table->boolean('accepts_call')->default(true)->after('accepts_chat');
            $table->boolean('accepts_video')->default(false)->after('accepts_call');
            $table->boolean('is_first_free')->default(false)->after('accepts_video');
            $table->timestamp('last_seen_at')->nullable()->after('is_first_free');
        });

        Schema::create('astrologer_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->boolean('is_online')->default(false);
            $table->boolean('accepts_chat')->default(true);
            $table->boolean('accepts_call')->default(true);
            $table->boolean('accepts_video')->default(false);
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('astrologer_statuses');
        Schema::table('astrologer_profiles', function (Blueprint $table) {
            $table->dropColumn(['is_online', 'accepts_chat', 'accepts_call', 'accepts_video', 'is_first_free', 'last_seen_at']);
        });
    }
};
