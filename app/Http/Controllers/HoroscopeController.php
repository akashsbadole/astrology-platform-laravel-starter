<?php

namespace App\Http\Controllers;

use App\Models\Horoscope;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;

class HoroscopeController extends Controller
{
    public const RASHIS = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];

    public function index(Request $request): Response|JsonResponse
    {
        $period = $request->query('period', 'daily');
        $date = $request->query('date', now()->toDateString());
        $list = Horoscope::where('period', $period)->where('date', $date)->get()->keyBy('rashi');

        $items = collect(self::RASHIS)->map(fn ($r) => [
            'rashi' => $r,
            'title' => $list[$r]->title ?? null,
            'body' => $list[$r]->body ?? 'Horoscope updating soon. Check Panchang and talk to an astrologer for guidance.',
            'lucky_color' => $list[$r]->lucky_color ?? null,
            'lucky_number' => $list[$r]->lucky_number ?? null,
        ])->values();

        if ($request->wantsJson()) {
            return response()->json([
                'rashis' => self::RASHIS,
                'period' => $period,
                'date' => $date,
                'items' => $items,
            ]);
        }

        return Inertia::render('horoscope/index', [
            'rashis' => self::RASHIS, 'period' => $period, 'date' => $date,
            'items' => $items,
        ]);
    }

    public function show(Request $request, string $rashi): Response|JsonResponse
    {
        $period = $request->query('period', 'daily');
        $h = Horoscope::where('rashi', $rashi)->where('period', $period)->latest('date')->first();

        $horoscope = $h ? ['title' => $h->title, 'body' => $h->body, 'lucky_color' => $h->lucky_color, 'lucky_number' => $h->lucky_number, 'lucky_time' => $h->lucky_time, 'date' => $h->date?->toDateString()] : null;

        if ($request->wantsJson()) {
            return response()->json([
                'rashi' => $rashi,
                'period' => $period,
                'horoscope' => $horoscope,
                'rashis' => self::RASHIS,
            ]);
        }

        return Inertia::render('horoscope/show', [
            'rashi' => $rashi, 'period' => $period,
            'horoscope' => $horoscope,
            'rashis' => self::RASHIS,
        ]);
    }
}
