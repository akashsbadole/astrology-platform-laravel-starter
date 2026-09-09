<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GeocodingService
{
    /**
     * @return array{latitude: float, longitude: float, display_name: string}|null
     */
    public function geocode(string $place): ?array
    {
        $response = Http::withHeaders([
            'User-Agent' => config('app.name').' (Kundli birth-place lookup)',
        ])->get('https://nominatim.openstreetmap.org/search', [
            'q' => $place,
            'format' => 'json',
            'limit' => 1,
        ]);

        if ($response->failed()) {
            return null;
        }

        $results = $response->json();

        if (empty($results)) {
            return null;
        }

        $first = $results[0];

        return [
            'latitude' => (float) $first['lat'],
            'longitude' => (float) $first['lon'],
            'display_name' => $first['display_name'],
        ];
    }
}
