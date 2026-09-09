<?php

namespace App\Services\Astrology;

use Illuminate\Support\Facades\Process;
use RuntimeException;

class PanchangCalculator
{
    /**
     * @return array{weekday: int, ayanamsa: float, sun: array{tropical: float, sidereal: float}, moon: array{tropical: float, sidereal: float}, sunrise: string, sunset: string}
     */
    public function calculate(int $year, int $month, int $day, float $utcOffsetHours, float $latitude, float $longitude): array
    {
        $payload = json_encode([
            'year' => $year,
            'month' => $month,
            'day' => $day,
            'utcOffsetHours' => $utcOffsetHours,
            'latitude' => $latitude,
            'longitude' => $longitude,
        ]);

        $scriptPath = base_path('scripts/panchang-calculate.mjs');

        $result = Process::input($payload)->run(['node', $scriptPath]);

        if ($result->failed()) {
            throw new RuntimeException('Panchang calculation failed: '.$result->errorOutput());
        }

        $decoded = json_decode($result->output(), true);

        if (! is_array($decoded)) {
            throw new RuntimeException('Panchang calculation returned invalid output.');
        }

        return $decoded;
    }
}
