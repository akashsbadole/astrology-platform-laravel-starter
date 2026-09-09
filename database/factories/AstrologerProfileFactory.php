<?php

namespace Database\Factories;

use App\Models\AstrologerProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AstrologerProfile>
 */
class AstrologerProfileFactory extends Factory
{
    protected $model = AstrologerProfile::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => 'astrologer']),
            'bio' => fake()->paragraph(),
            'specializations' => fake()->randomElements(
                ['Vedic', 'Numerology', 'Tarot', 'Palmistry', 'Vastu', 'KP System'],
                fake()->numberBetween(1, 3)
            ),
            'languages' => fake()->randomElements(['English', 'Hindi', 'Marathi', 'Tamil'], 2),
            'experience_years' => fake()->numberBetween(1, 25),
            'rate_chat_per_min' => fake()->randomFloat(2, 5, 50),
            'rate_call_per_min' => fake()->randomFloat(2, 8, 60),
            'rate_video_per_min' => fake()->randomFloat(2, 10, 80),
            'status' => 'pending',
            'rating_avg' => 0,
            'rating_count' => 0,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'approved_at' => now(),
        ]);
    }
}
