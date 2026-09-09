<?php

namespace App\Services\Astrology;

use Illuminate\Support\Carbon;

class VimshottariDasha
{
    private const DAYS_PER_YEAR = 365.2425;

    /**
     * Compute Mahadasha (major period) timeline starting from birth,
     * covering the given number of years (default spans a full lifetime).
     *
     * @return array<int, array{lord: string, starts_at: string, ends_at: string, years: float, antardashas: array<int, array{lord: string, starts_at: string, ends_at: string}>}>
     */
    public static function timeline(Carbon $birthDate, float $moonSiderealLongitude, float $totalYears = 120): array
    {
        $lords = VedicReference::DASHA_LORDS;
        $startLord = VedicReference::nakshatraLord($moonSiderealLongitude);
        $startIndex = array_search($startLord, $lords, true);
        $elapsedFraction = VedicReference::nakshatraElapsedFraction($moonSiderealLongitude);

        $periods = [];
        $cursor = $birthDate->clone();
        $yearsAccumulated = 0.0;
        $index = $startIndex;
        $first = true;

        while ($yearsAccumulated < $totalYears) {
            $lord = $lords[$index % 9];
            $fullYears = VedicReference::DASHA_YEARS[$lord];

            // The first (birth) dasha is only the remaining balance;
            // every subsequent one runs its full duration.
            $years = $first ? $fullYears * (1 - $elapsedFraction) : $fullYears;
            $first = false;

            $days = $years * self::DAYS_PER_YEAR;
            $start = $cursor->clone();
            $end = $cursor->clone()->addDays((int) round($days));

            $periods[] = [
                'lord' => $lord,
                'starts_at' => $start->toDateString(),
                'ends_at' => $end->toDateString(),
                'years' => round($years, 2),
                'antardashas' => self::antardashas($lord, $start, $fullYears, $years),
            ];

            $cursor = $end;
            $yearsAccumulated += $years;
            $index++;
        }

        return $periods;
    }

    /**
     * Sub-periods (Antardasha) within a Mahadasha. The sequence starts with
     * the Mahadasha's own lord and cycles through all 9 lords; each one's
     * share is proportional to (mahadashaYears * antardashaLordYears / 120).
     * If the Mahadasha itself was truncated (the birth period), only the
     * antardashas remaining are returned, each proportionally shortened.
     *
     * @return array<int, array{lord: string, starts_at: string, ends_at: string}>
     */
    private static function antardashas(string $mahadashaLord, Carbon $mahadashaStart, float $fullMahadashaYears, float $actualMahadashaYears): array
    {
        $lords = VedicReference::DASHA_LORDS;
        $startIndex = array_search($mahadashaLord, $lords, true);

        $fullPeriodDays = $fullMahadashaYears * self::DAYS_PER_YEAR;
        $truncatedFraction = $actualMahadashaYears / $fullMahadashaYears;
        $skippedDays = $fullPeriodDays * (1 - $truncatedFraction);

        $antardashas = [];
        $cursor = 0.0; // days from the (untruncated) mahadasha start

        for ($i = 0; $i < 9; $i++) {
            $antardashaLord = $lords[($startIndex + $i) % 9];
            $antardashaDays = $fullPeriodDays * (VedicReference::DASHA_YEARS[$antardashaLord] / 120);

            $segmentStart = $cursor;
            $segmentEnd = $cursor + $antardashaDays;
            $cursor = $segmentEnd;

            if ($segmentEnd <= $skippedDays) {
                continue; // fully in the past, before this truncated dasha began
            }

            $visibleStartDays = max($segmentStart, $skippedDays) - $skippedDays;
            $visibleEndDays = $segmentEnd - $skippedDays;

            $antardashas[] = [
                'lord' => $antardashaLord,
                'starts_at' => $mahadashaStart->clone()->addDays((int) round($visibleStartDays))->toDateString(),
                'ends_at' => $mahadashaStart->clone()->addDays((int) round($visibleEndDays))->toDateString(),
            ];
        }

        return $antardashas;
    }
}
