<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\AstrologerAvailability;
use App\Models\AstrologerProfile;
use App\Models\ForumCategory;
use App\Models\Taxonomy;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        foreach (['Vedic', 'Numerology', 'Tarot', 'Palmistry', 'Vastu', 'KP System', 'Face Reading', 'Kundli Matching'] as $name) {
            Taxonomy::create(['type' => 'specialization', 'name' => $name]);
        }

        foreach (['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Kannada'] as $name) {
            Taxonomy::create(['type' => 'language', 'name' => $name]);
        }

        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'role' => UserRole::Admin,
        ]);

        $astrologer = User::factory()->create([
            'name' => 'Demo Astrologer',
            'email' => 'astrologer@example.com',
            'role' => UserRole::Astrologer,
        ]);

        AstrologerProfile::create([
            'user_id' => $astrologer->id,
            'bio' => 'Vedic astrologer with over a decade of experience in Kundli analysis and matchmaking.',
            'specializations' => ['Vedic', 'Kundli Matching', 'Numerology'],
            'languages' => ['English', 'Hindi'],
            'experience_years' => 12,
            'rate_chat_per_min' => 15,
            'rate_call_per_min' => 20,
            'rate_video_per_min' => 25,
            'status' => 'approved',
            'approved_at' => now(),
            'rating_avg' => 4.8,
            'rating_count' => 120,
        ]);

        foreach (range(1, 5) as $weekday) {
            AstrologerAvailability::create([
                'user_id' => $astrologer->id,
                'day_of_week' => $weekday,
                'start_time' => '10:00',
                'end_time' => '18:00',
            ]);
        }

        User::factory()->create([
            'name' => 'Demo Customer',
            'email' => 'customer@example.com',
            'role' => UserRole::Customer,
        ]);

        foreach ([
            ['name' => 'General Discussion', 'slug' => 'general', 'description' => 'Talk about astrology, poojas and spirituality.'],
            ['name' => 'Kundli & Horoscope', 'slug' => 'kundli-horoscope', 'description' => 'Birth charts, predictions and remedies.'],
            ['name' => 'Pooja & Rituals', 'slug' => 'pooja-rituals', 'description' => 'Ask about pooja vidhi, samagri and bookings.'],
        ] as $category) {
            ForumCategory::firstOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
