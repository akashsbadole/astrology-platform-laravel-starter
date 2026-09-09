<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('poojas', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category'); // daily | weekly | monthly | special_occasion
            $table->text('description')->nullable();
            $table->text('benefits')->nullable();
            $table->text('vidhi')->nullable(); // procedure
            $table->json('samagri')->nullable(); // ingredients list
            $table->unsignedSmallInteger('duration_minutes')->default(60);
            $table->decimal('price', 10, 2);
            $table->boolean('is_online')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('category');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('poojas');
    }
};
