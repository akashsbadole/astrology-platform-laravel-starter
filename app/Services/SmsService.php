<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    /**
     * Send an SMS. Default driver is `log` so local/dev works without
     * credentials. Configure SMS_DRIVER=twilio|msg91 plus keys for prod.
     */
    public function send(string $to, string $message): bool
    {
        $driver = config('services.sms.driver', 'log');

        if ($driver === 'log' || app()->environment('testing')) {
            Log::info('[SMS] to='.$to.' message='.$message);

            return true;
        }

        if ($driver === 'twilio') {
            return $this->sendViaTwilio($to, $message);
        }

        if ($driver === 'msg91') {
            return $this->sendViaMsg91($to, $message);
        }

        Log::warning('[SMS] unknown driver='.$driver.', falling back to log. to='.$to);

        return true;
    }

    private function sendViaTwilio(string $to, string $message): bool
    {
        $sid = config('services.sms.twilio_sid');
        $token = config('services.sms.twilio_token');
        $from = config('services.sms.twilio_from');

        if (! $sid || ! $token || ! $from) {
            Log::warning('[SMS] twilio not configured, logging instead. to='.$to);

            return true;
        }

        $response = Http::withBasicAuth($sid, $token)
            ->asForm()
            ->post("https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json", [
                'To' => $to,
                'From' => $from,
                'Body' => $message,
            ]);

        if ($response->failed()) {
            Log::error('[SMS] twilio failed: '.$response->body());

            return false;
        }

        return true;
    }

    private function sendViaMsg91(string $to, string $message): bool
    {
        $key = config('services.sms.msg91_key');
        $sender = config('services.sms.msg91_sender');

        if (! $key) {
            Log::warning('[SMS] msg91 not configured, logging instead. to='.$to);

            return true;
        }

        $response = Http::asJson()->post('https://api.msg91.com/api/v5/flow/', [
            'flow_id' => config('services.sms.msg91_flow', ''),
            'sender' => $sender,
            'mobiles' => $to,
            'message' => $message,
        ], );

        // MSG91 flow API shape varies; fall back to generic send endpoint.
        if ($response->failed()) {
            $fallback = Http::get('https://api.msg91.com/api/v5/otp', [
                'authkey' => $key,
                'mobile' => $to,
                'message' => $message,
                'sender' => $sender,
            ]);

            if ($fallback->failed()) {
                Log::error('[SMS] msg91 failed: '.$fallback->body());

                return false;
            }
        }

        return true;
    }
}
