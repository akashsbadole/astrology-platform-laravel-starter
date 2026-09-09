<?php

namespace App\Services\Astrology;

class PanchangReference
{
    /** @var array<int, string> The 15 tithi names, reused for both Shukla and Krishna paksha (15th is Purnima/Amavasya respectively). */
    public const TITHI_NAMES = [
        'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
        'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
        'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya',
    ];

    /** @var array<int, string> */
    public const YOGA_NAMES = [
        'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
        'Sukarma', 'Dhriti', 'Shoola', 'Ganda', 'Vriddhi', 'Dhruva',
        'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana',
        'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
        'Brahma', 'Indra', 'Vaidhriti',
    ];

    /** @var array<int, string> The 7 movable karanas, cycled 8 times through a lunar month. */
    public const MOVABLE_KARANAS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'];

    /** @var array<int, string> Weekday names, index 0 = Sunday (matches JS getUTCDay()). */
    public const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    /**
     * Which 1/8th segment of daylight (1-8, counting from sunrise) is Rahu
     * Kalam, indexed by weekday (0=Sunday).
     *
     * @var array<int, int>
     */
    private const RAHU_KALAM_SEGMENT = [8, 2, 7, 5, 6, 4, 3];

    /** @var array<int, int> */
    private const YAMAGANDA_SEGMENT = [5, 4, 3, 2, 1, 7, 6];

    /** @var array<int, int> */
    private const GULIKA_KALAM_SEGMENT = [7, 6, 5, 4, 3, 2, 1];

    /**
     * @return array{number: int, name: string, paksha: string}
     */
    public static function tithi(float $sunTropical, float $moonTropical): array
    {
        $diff = self::normalize($moonTropical - $sunTropical);
        $number = (int) floor($diff / 12) + 1; // 1-30

        $paksha = $number <= 15 ? 'Shukla' : 'Krishna';
        $withinPaksha = $number <= 15 ? $number : $number - 15;

        return [
            'number' => $number,
            'name' => self::TITHI_NAMES[$withinPaksha - 1],
            'paksha' => $paksha,
        ];
    }

    /**
     * @return array{number: int, name: string}
     */
    public static function yoga(float $sunSidereal, float $moonSidereal): array
    {
        $span = 360 / 27;
        $sum = self::normalize($sunSidereal + $moonSidereal);
        $number = (int) floor($sum / $span) + 1; // 1-27

        return [
            'number' => $number,
            'name' => self::YOGA_NAMES[$number - 1],
        ];
    }

    /**
     * @return array{number: int, name: string}
     */
    public static function karana(float $sunTropical, float $moonTropical): array
    {
        $diff = self::normalize($moonTropical - $sunTropical);
        $number = (int) floor($diff / 6) + 1; // 1-60

        $name = match (true) {
            $number === 1 => 'Kimstughna',
            $number >= 2 && $number <= 57 => self::MOVABLE_KARANAS[($number - 2) % 7],
            $number === 58 => 'Shakuni',
            $number === 59 => 'Chatushpada',
            default => 'Naga',
        };

        return ['number' => $number, 'name' => $name];
    }

    /**
     * Inauspicious periods (Rahu Kalam, Yamaganda, Gulika Kalam), each as a
     * fraction-of-daylight window converted to actual start/end times by the
     * caller, who supplies sunrise/sunset as timestamps.
     *
     * @return array<string, array{segment: int, start_fraction: float, end_fraction: float}>
     */
    public static function inauspiciousPeriods(int $weekday): array
    {
        $build = fn (int $segment) => [
            'segment' => $segment,
            'start_fraction' => ($segment - 1) / 8,
            'end_fraction' => $segment / 8,
        ];

        return [
            'rahu_kalam' => $build(self::RAHU_KALAM_SEGMENT[$weekday]),
            'yamaganda' => $build(self::YAMAGANDA_SEGMENT[$weekday]),
            'gulika_kalam' => $build(self::GULIKA_KALAM_SEGMENT[$weekday]),
        ];
    }

    private static function normalize(float $degrees): float
    {
        $result = fmod($degrees, 360);

        return $result < 0 ? $result + 360 : $result;
    }
}
