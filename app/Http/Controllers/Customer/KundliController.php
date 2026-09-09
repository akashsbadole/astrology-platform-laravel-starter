<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Kundli;
use App\Services\Astrology\KundliCalculator;
use App\Services\Astrology\VedicReference;
use App\Services\Astrology\VimshottariDasha;
use App\Services\GeocodingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class KundliController extends Controller
{
    public function index(Request $request): Response
    {
        $kundlis = $request->user()
            ->kundlis()
            ->latest()
            ->get()
            ->map(fn (Kundli $kundli) => [
                'id' => $kundli->id,
                'profile_name' => $kundli->profile_name,
                'date_of_birth' => $kundli->date_of_birth->toDateString(),
                'birth_place' => $kundli->birth_place,
                'moon_rashi' => VedicReference::rashiName($kundli->moonSiderealLongitude()),
                'moon_nakshatra' => VedicReference::nakshatraName($kundli->moonSiderealLongitude()),
            ]);

        return Inertia::render('customer/kundli/index', [
            'kundlis' => $kundlis,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('customer/kundli/create');
    }

    public function store(Request $request, GeocodingService $geocoder, KundliCalculator $calculator): RedirectResponse
    {
        $validated = $request->validate([
            'profile_name' => ['required', 'string', 'max:100'],
            'gender' => ['nullable', 'in:male,female,other'],
            'date_of_birth' => ['required', 'date', 'before:tomorrow'],
            'time_of_birth' => ['required', 'date_format:H:i'],
            'birth_place' => ['required', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'utc_offset_hours' => ['required', 'numeric', 'between:-12,14'],
        ]);

        $latitude = $validated['latitude'] ?? null;
        $longitude = $validated['longitude'] ?? null;

        if ($latitude === null || $longitude === null) {
            $geocoded = $geocoder->geocode($validated['birth_place']);

            if (! $geocoded) {
                throw ValidationException::withMessages([
                    'birth_place' => 'Could not find that location. Please enter latitude/longitude manually.',
                ]);
            }

            $latitude = $geocoded['latitude'];
            $longitude = $geocoded['longitude'];
        }

        $date = Carbon::parse($validated['date_of_birth']);
        [$hour, $minute] = array_map('intval', explode(':', $validated['time_of_birth']));

        $result = $calculator->calculate(
            year: (int) $date->format('Y'),
            month: (int) $date->format('m'),
            day: (int) $date->format('d'),
            hour: $hour,
            minute: $minute,
            second: 0,
            utcOffsetHours: (float) $validated['utc_offset_hours'],
            latitude: $latitude,
            longitude: $longitude,
        );

        $kundli = $request->user()->kundlis()->create([
            'profile_name' => $validated['profile_name'],
            'gender' => $validated['gender'] ?? null,
            'date_of_birth' => $validated['date_of_birth'],
            'time_of_birth' => $validated['time_of_birth'],
            'birth_place' => $validated['birth_place'],
            'latitude' => $latitude,
            'longitude' => $longitude,
            'utc_offset_hours' => $validated['utc_offset_hours'],
            'ayanamsa' => $result['ayanamsa'],
            'ascendant_longitude' => $result['ascendant'],
            'planets' => $result['planets'],
        ]);

        return redirect()->route('customer.kundli.show', $kundli);
    }

    public function show(Request $request, Kundli $kundli): Response
    {
        abort_unless($kundli->user_id === $request->user()->id, 403);

        $birthDateTime = Carbon::parse($kundli->date_of_birth->toDateString().' '.$kundli->time_of_birth);

        $dashaTimeline = VimshottariDasha::timeline($birthDateTime, $kundli->moonSiderealLongitude());

        return Inertia::render('customer/kundli/show', [
            'kundli' => [
                'id' => $kundli->id,
                'profile_name' => $kundli->profile_name,
                'date_of_birth' => $kundli->date_of_birth->toDateString(),
                'time_of_birth' => substr($kundli->time_of_birth, 0, 5),
                'birth_place' => $kundli->birth_place,
                'ascendant_rashi' => $kundli->ascendantRashi(),
                'ascendant_rashi_index' => $kundli->ascendantRashiIndex(),
                'ayanamsa' => round((float) $kundli->ayanamsa, 4),
            ],
            'placements' => $kundli->placements(),
            'dashaTimeline' => $dashaTimeline,
        ]);
    }

    public function destroy(Request $request, Kundli $kundli): RedirectResponse
    {
        abort_unless($kundli->user_id === $request->user()->id, 403);

        $kundli->delete();

        return redirect()->route('customer.kundli.index');
    }
}
