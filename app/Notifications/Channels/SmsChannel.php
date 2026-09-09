<?php

namespace App\Notifications\Channels;

use App\Services\SmsService;
use Illuminate\Notifications\Notification;

class SmsChannel
{
    public function __construct(private readonly SmsService $sms) {}

    public function send(object $notifiable, Notification $notification): void
    {
        if (method_exists($notifiable, 'prefersChannel') && ! $notifiable->prefersChannel('sms')) {
            return;
        }

        if (! method_exists($notification, 'toSms')) {
            return;
        }

        $payload = $notification->toSms($notifiable);
        $to = $payload['to'] ?? $notifiable->phone ?? null;
        $message = $payload['message'] ?? '';

        if (! $to || ! $message) {
            return;
        }

        $this->sms->send($to, $message);
    }
}
