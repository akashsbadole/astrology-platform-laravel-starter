<?php

namespace App\Services\Astrology;

class VedicReference
{
    /** @var array<int, string> */
    public const RASHIS = [
        'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)',
        'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)',
        'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)',
    ];

    /** @var array<int, string> */
    public const NAKSHATRAS = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
        'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
        'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
        'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
    ];

    /**
     * The 9 Vimshottari dasha lords, in their fixed cyclic order. Each of the
     * 27 nakshatras is ruled by lords[index % 9] in this same order.
     *
     * @var array<int, string>
     */
    public const DASHA_LORDS = [
        'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
    ];

    /**
     * Vimshottari dasha years per lord. Totals 120 years.
     *
     * @var array<string, int>
     */
    public const DASHA_YEARS = [
        'Ketu' => 7, 'Venus' => 20, 'Sun' => 6, 'Moon' => 10, 'Mars' => 7,
        'Rahu' => 18, 'Jupiter' => 16, 'Saturn' => 19, 'Mercury' => 17,
    ];

    private const NAKSHATRA_SPAN = 360 / 27; // 13.333... degrees

    private const PADA_SPAN = self::NAKSHATRA_SPAN / 4; // 3.333... degrees

    public static function rashiIndex(float $siderealLongitude): int
    {
        return (int) floor(self::normalize($siderealLongitude) / 30) % 12;
    }

    public static function rashiName(float $siderealLongitude): string
    {
        return self::RASHIS[self::rashiIndex($siderealLongitude)];
    }

    public static function nakshatraIndex(float $siderealLongitude): int
    {
        return (int) floor(self::normalize($siderealLongitude) / self::NAKSHATRA_SPAN) % 27;
    }

    public static function nakshatraName(float $siderealLongitude): string
    {
        return self::NAKSHATRAS[self::nakshatraIndex($siderealLongitude)];
    }

    public static function nakshatraPada(float $siderealLongitude): int
    {
        $lon = self::normalize($siderealLongitude);
        $withinNakshatra = fmod($lon, self::NAKSHATRA_SPAN);

        return (int) floor($withinNakshatra / self::PADA_SPAN) + 1; // 1-4
    }

    public static function nakshatraLord(float $siderealLongitude): string
    {
        return self::DASHA_LORDS[self::nakshatraIndex($siderealLongitude) % 9];
    }

    /**
     * Fraction (0-1) of the current nakshatra's span the Moon has already
     * travelled through. Used to compute the balance of the first dasha.
     */
    public static function nakshatraElapsedFraction(float $siderealLongitude): float
    {
        $lon = self::normalize($siderealLongitude);
        $withinNakshatra = fmod($lon, self::NAKSHATRA_SPAN);

        return $withinNakshatra / self::NAKSHATRA_SPAN;
    }

    private static function normalize(float $degrees): float
    {
        $result = fmod($degrees, 360);

        return $result < 0 ? $result + 360 : $result;
    }
}
