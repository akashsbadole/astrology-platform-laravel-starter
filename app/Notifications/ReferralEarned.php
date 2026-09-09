<?php

namespace App\Notifications;

use App\Notifications\Channels\PushChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReferralEarned extends Notification
{
    use Queueable;

    public function __construct(private readonly int $points, private readonly string $code) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database', PushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('You earned '.$this->points.' loyalty points!')
            ->greeting('Hi '.$notifiable->name.',')
            ->line('Your referral code '.$this->code.' just earned you '.$this->points.' points.')
            ->action('View rewards', url('/referrals'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return $this->toPush($notifiable);
    }

    /**
     * @return array<string, mixed>
     */
    public function toPush(object $notifiable): array
    {
        return [
            'title' => 'Referral reward earned',
            'body' => "+{$this->points} points from referral {$this->code}",
            'url' => '/referrals',
        ];
    }
}
