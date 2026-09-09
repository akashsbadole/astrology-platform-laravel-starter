<?php

namespace App\Services;

use App\Models\Kundli;

class KundliMatchingService
{
    private const GUNA_MAX = [6, 6, 8, 5, 1, 2, 1, 2];

    public function match(Kundli $a, Kundli $b): array
    {
        $pa = $a->placements();
        $pb = $b->placements();
        $moonA = (float) $a->planets['moon'];
        $moonB = (float) $b->planets['moon'];

        // Deterministic pseudo-guna breakdown from moon longitudes (MVP, documented as estimate).
        $scores = [];
        $total = 0;
        $labels = ['Varna', 'Vashya', 'Tara', 'Yoni', 'Graha Maitri', 'Gana', 'Bhakoot', 'Nadi'];
        foreach ($labels as $i => $label) {
            $seed = (int) (abs($moonA * 7 + $moonB * 13 + $i * 37) * 100) % ($i + 2);
            $score = min(self::GUNA_MAX[$i], $seed % (self::GUNA_MAX[$i] + 1));
            // Nadi zero-check
            if ($i === 7 && (($moonA + $moonB) % 9) < 1) {
                $score = 0;
            }
            $scores[] = ['name' => $label, 'score' => $score, 'max' => self::GUNA_MAX[$i]];
            $total += $score;
        }

        $manglikA = $this->isManglik($pa);
        $manglikB = $this->isManglik($pb);

        $verdict = $total >= 28 ? 'Excellent match' : ($total >= 18 ? 'Good match — consult astrologer for remedies' : 'Low compatibility — detailed consultation advised');

        return [
            'score' => $total,
            'max' => 36,
            'percent' => round($total / 36 * 100, 1),
            'breakdown' => $scores,
            'manglik' => ['a' => $manglikA, 'b' => $manglikB],
            'verdict' => $verdict,
            'note' => 'Instant estimate. Confirm with an astrologer before big decisions.',
        ];
    }

    private function isManglik(array $placements): bool
    {
        $mars = $placements['mars'] ?? null;
        if (! $mars) {
            return false;
        }

        return in_array($mars['house'], [1, 2, 4, 7, 8, 12], true);
    }
}
