<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->timestamp('connected_at')->nullable()->after('started_at');
            $table->string('missed_by')->nullable()->after('end_reason'); // customer|astrologer|null
        });

        Schema::create('consultation_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('kind'); // requested|accepted|connected|heartbeat|signal|ended|missed|cancelled|recording
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->index(['consultation_id', 'kind']);
        });

        Schema::create('call_recordings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->string('disk')->default('local');
            $table->string('mime')->nullable();
            $table->bigInteger('size_bytes')->default(0);
            $table->integer('duration_seconds')->nullable();
            $table->string('status')->default('ready'); // ready|processing|failed
            $table->timestamps();
            $table->index('consultation_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('call_recordings');
        Schema::dropIfExists('consultation_events');
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropColumn(['connected_at', 'missed_by']);
        });
    }
};
