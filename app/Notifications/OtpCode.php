<?php

namespace App\Notifications;

use App\Notifications\Channels\SmsChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OtpCode extends Notification
{
    use Queueable;

    public function __construct(private readonly string $code) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // OTP is delivered over SMS; mail only as fallback when no phone.
        if (! empty($notifiable->phone)) {
            return [SmsChannel::class];
        }

        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your login code')
            ->line('Your one-time login code is: '.$this->code)
            ->line('It expires in 5 minutes. Do not share it with anyone.');
    }

    /**
     * @return array<string, string|null>
     */
    public function toSms(object $notifiable): array
    {
        return [
            'to' => $notifiable->phone ?? null,
            'message' => 'Your Astro login code is '.$this->code.'. Valid for 5 minutes.',
        ];
    }
}
