<?php

namespace App\Services;

use App\Models\DeviceToken;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FcmService
{
    public function sendToUser(int $userId, string $title, string $body, array $data = []): bool
    {
        $tokens = DeviceToken::where('user_id', $userId)->pluck('token')->all();
        if ($tokens === []) {
            return true;
        }
        $key = config('services.fcm.server_key');
        if (! $key) {
            Log::info('[FCM] (log driver) user='.$userId.' title='.$title.' tokens='.count($tokens));

            return true;
        }
        try {
            $response = Http::withToken($key)->asJson()->post('https://fcm.googleapis.com/fcm/send', [
                'registration_ids' => $tokens,
                'notification' => ['title' => $title, 'body' => $body],
                'data' => $data,
            ]);

            return ! $response->failed();
        } catch (\Throwable $e) {
            Log::error('[FCM] failed: '.$e->getMessage());

            return false;
        }
    }
}
