<?php

namespace App\Notifications;

use App\Models\PoojaBooking;
use App\Notifications\Channels\PushChannel;
use App\Notifications\Channels\SmsChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PoojaBookingConfirmed extends Notification
{
    use Queueable;

    public function __construct(private readonly PoojaBooking $booking) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['mail', 'database', PushChannel::class];

        if ($notifiable->phone) {
            $channels[] = SmsChannel::class;
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->booking->loadMissing('pooja');

        return (new MailMessage)
            ->subject('Pooja booking confirmed - '.$this->booking->pooja->name)
            ->greeting('Hi '.$notifiable->name.',')
            ->line('Your pooja booking for '.$this->booking->pooja->name.' on '.$this->booking->scheduled_date->format('M j, Y').' is confirmed.')
            ->action('Open support chat', url('/customer/pooja-bookings/'.$this->booking->id.'/chat'))
            ->line('You can chat with our support team anytime from your bookings page.');
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
            'title' => 'Pooja booking confirmed',
            'body' => 'Your pooja on '.$this->booking->scheduled_date->format('M j, Y').' is confirmed.',
            'url' => '/customer/pooja-bookings',
            'pooja_booking_id' => $this->booking->id,
        ];
    }

    /**
     * @return array<string, string|null>
     */
    public function toSms(object $notifiable): array
    {
        return [
            'to' => $notifiable->phone,
            'message' => 'Astro: your pooja booking for '.$this->booking->scheduled_date->format('M j').' is confirmed. Support chat is now open.',
        ];
    }
}
