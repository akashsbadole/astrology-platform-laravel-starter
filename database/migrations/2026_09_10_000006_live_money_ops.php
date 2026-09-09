<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('live_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('astrologer_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('scheduled'); // scheduled|live|ended
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->integer('entry_fee_paise')->default(0);
            $table->string('room_id')->nullable();
            $table->timestamps();
        });

        Schema::create('live_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('live_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('joined_at')->nullable();
            $table->timestamps();
            $table->unique(['live_session_id', 'user_id']);
        });

        Schema::create('live_gifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('live_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->string('gift')->default('rose');
            $table->integer('amount_paise')->default(0);
            $table->timestamps();
        });

        Schema::create('astrologer_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('astrologer_id')->constrained('users')->cascadeOnDelete();
            $table->nullableMorphs('reference'); // consultation|gift|order
            $table->bigInteger('gross_paise')->default(0);
            $table->bigInteger('commission_paise')->default(0);
            $table->bigInteger('net_paise')->default(0);
            $table->string('status')->default('accrued'); // accrued|payable|paid
            $table->timestamps();
        });

        Schema::create('payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('astrologer_id')->constrained('users')->cascadeOnDelete();
            $table->bigInteger('amount_paise');
            $table->string('status')->default('requested'); // requested|approved|paid|rejected
            $table->string('utr')->nullable();
            $table->timestamps();
        });

        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->nullableMorphs('reference');
            $table->bigInteger('amount_paise');
            $table->string('reason')->nullable();
            $table->string('status')->default('requested'); // requested|approved|rejected|processed
            $table->timestamps();
        });

        Schema::create('disputes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->nullableMorphs('reference');
            $table->string('subject');
            $table->text('description')->nullable();
            $table->string('status')->default('open'); // open|in_review|resolved|closed
            $table->text('resolution')->nullable();
            $table->timestamps();
        });

        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('subject');
            $table->text('body')->nullable();
            $table->string('priority')->default('normal');
            $table->string('status')->default('open');
            $table->timestamps();
        });

        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('slot')->default('home');
            $table->string('title')->nullable();
            $table->string('image')->nullable();
            $table->string('link')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banners');
        Schema::dropIfExists('support_tickets');
        Schema::dropIfExists('disputes');
        Schema::dropIfExists('refunds');
        Schema::dropIfExists('payouts');
        Schema::dropIfExists('astrologer_earnings');
        Schema::dropIfExists('live_gifts');
        Schema::dropIfExists('live_participants');
        Schema::dropIfExists('live_sessions');
    }
};
