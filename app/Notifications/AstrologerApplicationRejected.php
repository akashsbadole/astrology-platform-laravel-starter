<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AstrologerApplicationRejected extends Notification
{
    use Queueable;

    public function __construct(private readonly string $reason) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your astrologer profile needs changes')
            ->greeting('Hi '.$notifiable->name.',')
            ->line('An admin reviewed your astrologer profile and it was not approved this time.')
            ->line('Reason: '.$this->reason)
            ->action('Update your profile', url('/astrologer/profile'))
            ->line('Once updated, your profile will automatically be queued for review again.');
    }
}
