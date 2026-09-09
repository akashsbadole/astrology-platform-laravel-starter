<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Services\Astrology\PanchangReference;
use App\Services\Astrology\VedicReference;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        $today = Carbon::today();
        $utcOffset = 5.5;

        $resolvedPlaceName = 'New Delhi, India';

        $demoPayload = $this->demoPayload($today);

        $sunrise = Carbon::parse($demoPayload['sunrise'])->addHours($utcOffset);
        $sunset = Carbon::parse($demoPayload['sunset'])->addHours($utcOffset);
        $daylightSeconds = $sunset->diffInSeconds($sunrise);

        $tithi = PanchangReference::tithi($demoPayload['sun']['tropical'], $demoPayload['moon']['tropical']);
        $nakshatraName = VedicReference::nakshatraName($demoPayload['moon']['sidereal']);
        $nakshatraPada = VedicReference::nakshatraPada($demoPayload['moon']['sidereal']);
        $yoga = PanchangReference::yoga($demoPayload['sun']['sidereal'], $demoPayload['moon']['sidereal']);
        $karana = PanchangReference::karana($demoPayload['sun']['tropical'], $demoPayload['moon']['tropical']);

        $weekdayIndex = (int) $demoPayload['weekday'];
        $weekdayName = PanchangReference::WEEKDAYS[$weekdayIndex];

        $periods = PanchangReference::inauspiciousPeriods($weekdayIndex);
        $formatPeriod = function (array $period) use ($sunrise, $daylightSeconds) {
            return [
                'starts_at' => $sunrise->clone()->addSeconds((int) round($daylightSeconds * $period['start_fraction']))->format('H:i'),
                'ends_at' => $sunrise->clone()->addSeconds((int) round($daylightSeconds * $period['end_fraction']))->format('H:i'),
            ];
        };

        $moonSiderealLongitude = $demoPayload['moon']['sidereal'];
        $moonRashi = VedicReference::rashiName($moonSiderealLongitude);

        $moonTropical = $demoPayload['moon']['tropical'];
        $sunTropical = $demoPayload['sun']['tropical'];
        $moonPhaseFraction = (self::normalize($moonTropical - $sunTropical) % 360) / 360;
        $lunarPhase = match (true) {
            $moonPhaseFraction < 0.03 || $moonPhaseFraction > 0.97 => 'New Moon',
            $moonPhaseFraction < 0.22 => 'Waxing Crescent',
            $moonPhaseFraction < 0.28 => 'First Quarter',
            $moonPhaseFraction < 0.47 => 'Waxing Gibbous',
            $moonPhaseFraction < 0.53 => 'Full Moon',
            $moonPhaseFraction < 0.72 => 'Waning Gibbous',
            $moonPhaseFraction < 0.78 => 'Last Quarter',
            default => 'Waning Crescent',
        };

        $festivals = $this->upcomingFestivals($today);

        $regionalHolidays = [
            ['state' => 'National', 'holidays' => ['Republic Day', 'Independence Day', 'Gandhi Jayanti', 'Diwali', 'Holi', 'Eid', 'Christmas']],
            ['state' => 'Maharashtra', 'holidays' => ['Gudi Padwa', 'Shivaji Jayanti', 'Dussehra', 'Ganesh Chaturthi']],
            ['state' => 'Karnataka', 'holidays' => ['Ugadi', 'Mysuru Dasara', 'Kannada Rajyotsava']],
            ['state' => 'Tamil Nadu', 'holidays' => ['Pongal', 'Tamil New Year', 'Deepavali']],
            ['state' => 'West Bengal', 'holidays' => ['Poila Boishakh', 'Durga Puja', 'Kali Puja']],
        ];

        $blogs = Post::published()
            ->with('author:id,name')
            ->latest('published_at')
            ->take(3)
            ->get()
            ->map(fn(Post $p) => [
                'id' => $p->id,
                'slug' => $p->slug,
                'title' => $p->title,
                'excerpt' => $p->excerpt,
                'published_at' => $p->published_at?->toDateString(),
                'author_name' => $p->author->name,
            ])
            ->values();

        return Inertia::render('welcome', [
            'today' => $today->toDateString(),
            'todayFormatted' => $today->format('l, d F Y'),
            'place' => $resolvedPlaceName,
            'weekday' => $weekdayName,
            'sunrise' => $sunrise->format('H:i'),
            'sunset' => $sunset->format('H:i'),
            'moonRashi' => $moonRashi,
            'lunarPhase' => $lunarPhase,
            'tithi' => [
                'name' => $tithi['name'],
                'paksha' => $tithi['paksha'],
                'number' => $tithi['number'],
            ],
            'nakshatra' => [
                'name' => $nakshatraName,
                'pada' => $nakshatraPada,
            ],
            'yoga' => [
                'name' => $yoga['name'],
                'number' => $yoga['number'],
            ],
            'karana' => [
                'name' => $karana['name'],
                'number' => $karana['number'],
            ],
            'inauspiciousPeriods' => [
                'rahu_kalam' => $formatPeriod($periods['rahu_kalam']),
                'yamaganda' => $formatPeriod($periods['yamaganda']),
                'gulika_kalam' => $formatPeriod($periods['gulika_kalam']),
            ],
            'festivals' => $festivals,
            'regionalHolidays' => $regionalHolidays,
            'blogs' => $blogs,
            'panchangNote' => 'Full Panchang is available on the Panchang page.',
        ]);
    }

    private static function normalize(float $degrees): float
    {
        $result = fmod($degrees, 360);

        return $result < 0 ? $result + 360 : $result;
    }

    private function demoPayload(Carbon $today): array
    {
        $dayOfYear = (int) $today->diffInDays(Carbon::create($today->year, 1, 1)) + 1;

        return [
            'weekday' => (int) $today->dayOfWeek,
            'sunrise' => $today->copy()->setTime(6, 12)->toIso8601String(),
            'sunset' => $today->copy()->setTime(18, 24)->toIso8601String(),
            'sun' => [
                'tropical' => (($dayOfYear / 365.25) * 360 + 280) % 360,
                'sidereal' => (($dayOfYear / 365.25) * 360 + 260) % 360,
            ],
            'moon' => [
                'tropical' => fmod((($dayOfYear / 29.530588853) * 360) + 120, 360),
                'sidereal' => fmod((($dayOfYear / 27.321661) * 360) + 95, 360),
            ],
        ];
    }

    /** @return array<int, array{name: string, date: string, description: string}> */
    private function upcomingFestivals(Carbon $today): array
    {
        $all = [
            ['name' => 'Makar Sankranti', 'month' => 1, 'day' => 14, 'description' => 'Harvest festival marking the transition of the Sun into Capricorn.'],
            ['name' => 'Republic Day', 'month' => 1, 'day' => 26, 'description' => 'National holiday commemorating the Constitution of India.'],
            ['name' => 'Maha Shivaratri', 'month' => 2, 'day' => 18, 'description' => 'Great night of Lord Shiva, observed with fasting and vigil.'],
            ['name' => 'Holi', 'month' => 3, 'day' => 25, 'description' => 'Festival of colors celebrating the victory of good over evil.'],
            ['name' => 'Ram Navami', 'month' => 3, 'day' => 6, 'description' => 'Birthday of Lord Rama, celebrated with devotion.'],
            ['name' => 'Raksha Bandhan', 'month' => 8, 'day' => 19, 'description' => 'Celebration of the bond between brothers and sisters.'],
            ['name' => 'Krishna Janmashtami', 'month' => 8, 'day' => 18, 'description' => 'Birth of Lord Krishna celebrated with fasting and night vigil.'],
            ['name' => 'Independence Day', 'month' => 8, 'day' => 15, 'description' => 'National holiday celebrating India\'s independence.'],
            ['name' => 'Ganesh Chaturthi', 'month' => 8, 'day' => 27, 'description' => 'Festival honoring Lord Ganesha with clay idols and prayers.'],
            ['name' => 'Navratri', 'month' => 9, 'day' => 22, 'description' => 'Nine nights dedicated to the worship of Goddess Durga.'],
            ['name' => 'Dussehra', 'month' => 10, 'day' => 1, 'description' => 'Victory of Lord Rama over Ravana and Goddess Durga over Mahishasura.'],
            ['name' => 'Diwali', 'month' => 10, 'day' => 20, 'description' => 'Festival of lights celebrating the return of Lord Rama to Ayodhya.'],
            ['name' => 'Govardhan Puja', 'month' => 10, 'day' => 21, 'description' => 'Celebration of Lord Krishna lifting Govardhan Hill.'],
            ['name' => 'Bhai Dooj', 'month' => 10, 'day' => 22, 'description' => 'Sister applies tilak on brother for his wellbeing.'],
            ['name' => 'Dev Deepavali', 'month' => 11, 'day' => 5, 'description' => 'Light festival in Varanasi honoring the gods.'],
            ['name' => 'Guru Nanak Jayanti', 'month' => 11, 'day' => 15, 'description' => 'Birth anniversary of Guru Nanak, founder of Sikhism.'],
            ['name' => 'Christmas', 'month' => 12, 'day' => 25, 'description' => 'Christian festival celebrating the birth of Jesus Christ.'],
        ];

        $currentYear = (int) $today->format('Y');
        $upcoming = [];

        foreach ($all as $festival) {
            $festivalDate = Carbon::create($currentYear, $festival['month'], $festival['day'])->startOfDay();

            if ($festivalDate->lt($today)) {
                $festivalDate = Carbon::create($currentYear + 1, $festival['month'], $festival['day'])->startOfDay();
            }

            $upcoming[] = [
                'name' => $festival['name'],
                'date' => $festivalDate->format('d M Y'),
                'description' => $festival['description'],
            ];
        }

        usort($upcoming, fn($a, $b) => strtotime($a['date']) <=> strtotime($b['date']));

        return array_slice($upcoming, 0, 8);
    }
}
