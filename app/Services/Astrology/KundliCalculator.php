<?php

namespace App\Services\Astrology;

use Illuminate\Support\Facades\Process;
use RuntimeException;

class KundliCalculator
{
    /**
     * @return array{julianDay: float, ayanamsa: float, ascendant: float, planets: array<string, float>}
     */
    public function calculate(
        int $year,
        int $month,
        int $day,
        int $hour,
        int $minute,
        int $second,
        float $utcOffsetHours,
        float $latitude,
        float $longitude,
    ): array {
        $payload = json_encode([
            'year' => $year,
            'month' => $month,
            'day' => $day,
            'hour' => $hour,
            'minute' => $minute,
            'second' => $second,
            'utcOffsetHours' => $utcOffsetHours,
            'latitude' => $latitude,
            'longitude' => $longitude,
        ]);

        $scriptPath = base_path('scripts/kundli-calculate.mjs');

        $result = Process::input($payload)->run(['node', $scriptPath]);

        if ($result->failed()) {
            throw new RuntimeException('Kundli calculation failed: '.$result->errorOutput());
        }

        $decoded = json_decode($result->output(), true);

        if (! is_array($decoded)) {
            throw new RuntimeException('Kundli calculation returned invalid output.');
        }

        return $decoded;
    }
}
