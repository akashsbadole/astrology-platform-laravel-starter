<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\AstrologerAvailability;
use App\Models\AstrologerProfile;
use App\Models\Banner;
use App\Models\Coupon;
use App\Models\ForumCategory;
use App\Models\Horoscope;
use App\Models\Product;
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
            'is_online' => true,
            'accepts_chat' => true,
            'accepts_call' => true,
            'accepts_video' => true,
            'is_first_free' => true,
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

        foreach (['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'] as $rashi) {
            Horoscope::firstOrCreate(['rashi' => $rashi, 'period' => 'daily', 'date' => now()->toDateString()], [
                'title' => $rashi.' daily guidance',
                'body' => 'Favourable day for planning, prayer and key talks. Avoid haste after sunset.',
                'lucky_color' => 'Yellow', 'lucky_number' => '9', 'lucky_time' => '10am-12pm',
            ]);
        }

        Coupon::firstOrCreate(['code' => 'FIRSTFREE'], ['type' => 'first_free', 'value_paise' => 0, 'is_active' => true, 'meta' => ['minutes' => 5]]);
        Coupon::firstOrCreate(['code' => 'RECHARGE10'], ['type' => 'recharge_bonus', 'value_paise' => 10000, 'min_order_paise' => 50000, 'is_active' => true]);

        Product::firstOrCreate(['slug' => 'yellow-sapphire'], ['name' => 'Yellow Sapphire (Pukhraj)', 'price_paise' => 510000, 'mrp_paise' => 710000, 'stock' => 20, 'description' => 'Energised pukhraj with lab report.', 'is_active' => true]);
        Product::firstOrCreate(['slug' => 'shri-yantra'], ['name' => 'Shri Yantra', 'price_paise' => 110000, 'stock' => 50, 'description' => 'Brass Shri Yantra for home temple.', 'is_active' => true]);

        Banner::firstOrCreate(['slot' => 'home', 'title' => 'First 5 min free'], ['link' => '/astrologers', 'is_active' => true, 'sort' => 0]);
    }
}
