<?php

namespace App\Http\Controllers;

use App\Services\Astrology\PanchangCalculator;
use App\Services\Astrology\PanchangReference;
use App\Services\Astrology\VedicReference;
use App\Services\GeocodingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PanchangController extends Controller
{
    public function show(Request $request, PanchangCalculator $calculator, GeocodingService $geocoder): Response|JsonResponse
    {
        $validated = $request->validate([
            'date' => ['nullable', 'date'],
            'place' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'utc_offset_hours' => ['nullable', 'numeric', 'between:-12,14'],
        ]);

        $date = isset($validated['date']) ? Carbon::parse($validated['date']) : Carbon::today();
        $place = $validated['place'] ?? 'New Delhi, India';
        $utcOffset = (float) ($validated['utc_offset_hours'] ?? 5.5);

        $latitude = $validated['latitude'] ?? null;
        $longitude = $validated['longitude'] ?? null;
        $resolvedPlaceName = $place;

        if ($latitude === null || $longitude === null) {
            $geocoded = $geocoder->geocode($place);

            if (! $geocoded) {
                throw ValidationException::withMessages([
                    'place' => 'Could not find that location.',
                ]);
            }

            $latitude = $geocoded['latitude'];
            $longitude = $geocoded['longitude'];
            $resolvedPlaceName = $geocoded['display_name'];
        }

        $result = $calculator->calculate(
            year: (int) $date->format('Y'),
            month: (int) $date->format('m'),
            day: (int) $date->format('d'),
            utcOffsetHours: $utcOffset,
            latitude: $latitude,
            longitude: $longitude,
        );

        $sunrise = Carbon::parse($result['sunrise'])->addHours($utcOffset);
        $sunset = Carbon::parse($result['sunset'])->addHours($utcOffset);
        $daylightSeconds = $sunset->diffInSeconds($sunrise);

        $periods = PanchangReference::inauspiciousPeriods($result['weekday']);
        $formatPeriod = function (array $period) use ($sunrise, $daylightSeconds) {
            return [
                'starts_at' => $sunrise->clone()->addSeconds((int) round($daylightSeconds * $period['start_fraction']))->toIso8601String(),
                'ends_at' => $sunrise->clone()->addSeconds((int) round($daylightSeconds * $period['end_fraction']))->toIso8601String(),
            ];
        };

        $payload = [
            'date' => $date->toDateString(),
            'place' => $resolvedPlaceName,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'utcOffsetHours' => $utcOffset,
            'weekday' => PanchangReference::WEEKDAYS[$result['weekday']],
            'sunrise' => $sunrise->toIso8601String(),
            'sunset' => $sunset->toIso8601String(),
            'tithi' => PanchangReference::tithi($result['sun']['tropical'], $result['moon']['tropical']),
            'nakshatra' => [
                'name' => VedicReference::nakshatraName($result['moon']['sidereal']),
                'pada' => VedicReference::nakshatraPada($result['moon']['sidereal']),
            ],
            'yoga' => PanchangReference::yoga($result['sun']['sidereal'], $result['moon']['sidereal']),
            'karana' => PanchangReference::karana($result['sun']['tropical'], $result['moon']['tropical']),
            'inauspiciousPeriods' => [
                'rahu_kalam' => $formatPeriod($periods['rahu_kalam']),
                'yamaganda' => $formatPeriod($periods['yamaganda']),
                'gulika_kalam' => $formatPeriod($periods['gulika_kalam']),
            ],
        ];

        if ($request->wantsJson()) {
            return response()->json($payload);
        }

        return Inertia::render('panchang/show', $payload);
    }
}
