<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('referred_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('code', 16);
            $table->string('status')->default('pending'); // pending | rewarded
            $table->timestamp('rewarded_at')->nullable();
            $table->timestamps();
        });

        Schema::create('loyalty_ledgers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('points'); // positive = earn, negative = redeem
            $table->string('type')->default('earn'); // earn | redeem | referral
            $table->nullableMorphs('reference');
            $table->string('description', 500)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_ledgers');
        Schema::dropIfExists('referrals');
    }
};
