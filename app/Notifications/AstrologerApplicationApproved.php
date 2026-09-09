<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AstrologerApplicationApproved extends Notification
{
    use Queueable;

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
            ->subject('Your astrologer profile has been approved')
            ->greeting('Congratulations '.$notifiable->name.'!')
            ->line('Your astrologer profile has been reviewed and approved.')
            ->line('You are now visible to customers browsing for a consultation.')
            ->action('View your profile', url('/astrologer/profile'));
    }
}
