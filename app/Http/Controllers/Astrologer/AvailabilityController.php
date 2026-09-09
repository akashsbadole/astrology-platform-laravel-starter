<?php

namespace App\Http\Controllers\Astrologer;

use App\Http\Controllers\Controller;
use App\Models\AstrologerAvailability;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AvailabilityController extends Controller
{
    private const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    public function index(Request $request): Response
    {
        $slots = $request->user()
            ->availabilities()
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->map(fn (AstrologerAvailability $slot) => [
                'id' => $slot->id,
                'day_of_week' => $slot->day_of_week,
                'day_label' => self::DAYS[$slot->day_of_week],
                'start_time' => substr($slot->start_time, 0, 5),
                'end_time' => substr($slot->end_time, 0, 5),
            ]);

        return Inertia::render('astrologer/availability', [
            'slots' => $slots,
            'days' => self::DAYS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'day_of_week' => ['required', 'integer', 'between:0,6'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        $user = $request->user();

        $overlaps = $user->availabilities()
            ->where('day_of_week', $validated['day_of_week'])
            ->where('start_time', '<', $validated['end_time'])
            ->where('end_time', '>', $validated['start_time'])
            ->exists();

        if ($overlaps) {
            throw ValidationException::withMessages([
                'start_time' => 'This overlaps with an existing slot on that day.',
            ]);
        }

        $user->availabilities()->create($validated);

        return back()->with('status', 'availability-added');
    }

    public function destroy(Request $request, AstrologerAvailability $availability): RedirectResponse
    {
        abort_unless($availability->user_id === $request->user()->id, 403);

        $availability->delete();

        return back()->with('status', 'availability-removed');
    }
}
