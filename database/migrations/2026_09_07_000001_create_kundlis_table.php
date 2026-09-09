<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kundlis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('profile_name');
            $table->string('gender')->nullable();
            $table->date('date_of_birth');
            $table->time('time_of_birth');
            $table->string('birth_place');
            $table->decimal('latitude', 9, 6);
            $table->decimal('longitude', 9, 6);
            $table->decimal('utc_offset_hours', 4, 2);
            $table->decimal('ayanamsa', 8, 5);
            $table->decimal('ascendant_longitude', 8, 5);
            $table->json('planets'); // sidereal longitudes: sun, moon, mercury, venus, mars, jupiter, saturn, rahu, ketu
            $table->timestamps();

            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kundlis');
    }
};
