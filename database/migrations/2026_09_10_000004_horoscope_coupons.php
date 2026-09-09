<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horoscopes', function (Blueprint $table) {
            $table->id();
            $table->string('rashi'); // Mesha..Meena / Aries..Pisces
            $table->string('period')->default('daily'); // daily|weekly|monthly|yearly
            $table->date('date')->nullable();
            $table->string('title')->nullable();
            $table->text('body');
            $table->string('lucky_color')->nullable();
            $table->string('lucky_number')->nullable();
            $table->string('lucky_time')->nullable();
            $table->timestamps();
            $table->unique(['rashi', 'period', 'date']);
            $table->index(['period', 'date']);
        });

        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('type')->default('flat'); // flat|percent|first_free|recharge_bonus
            $table->integer('value_paise')->default(0); // flat paise or percent*100 or free seconds/mins in meta
            $table->integer('min_order_paise')->default(0);
            $table->integer('max_uses')->nullable();
            $table->integer('used_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('coupon_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->nullableMorphs('reference');
            $table->timestamps();
            $table->unique(['coupon_id', 'user_id', 'reference_type', 'reference_id'], 'cr_unique_coupon_user_ref');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupon_redemptions');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('horoscopes');
    }
};
