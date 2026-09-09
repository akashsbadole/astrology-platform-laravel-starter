<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 20)->nullable()->unique()->after('email');
            $table->timestamp('phone_verified_at')->nullable()->after('phone');
            $table->string('locale', 10)->default('en')->after('remember_token');
            $table->string('referral_code', 16)->nullable()->unique()->after('locale');
            $table->foreignId('referred_by_id')->nullable()->after('referral_code')->constrained('users')->nullOnDelete();
            $table->integer('loyalty_points')->default(0)->after('referred_by_id');
            $table->string('provider', 30)->nullable()->after('loyalty_points');
            $table->string('provider_id')->nullable()->after('provider');
            $table->string('avatar')->nullable()->after('provider_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('referred_by_id');
            $table->dropColumn(['phone', 'phone_verified_at', 'locale', 'referral_code', 'loyalty_points', 'provider', 'provider_id', 'avatar']);
        });
    }
};
