<?php

namespace App\Console\Commands;

use App\Services\ConsultationService;
use Illuminate\Console\Command;

class TimeoutQueuedConsultations extends Command
{
    protected $signature = 'consultations:timeout-queued {--minutes=5}';

    protected $description = 'Mark stale queued consultations as missed (astrologer no-answer).';

    public function handle(ConsultationService $svc): int
    {
        $count = $svc->timeoutStaleQueued((int) $this->option('minutes'));
        $this->info("Timed out {$count} queued consultation(s).");

        return self::SUCCESS;
    }
}
