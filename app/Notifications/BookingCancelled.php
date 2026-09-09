<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Notifications\Channels\PushChannel;
use App\Notifications\Channels\SmsChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingCancelled extends Notification
{
    use Queueable;

    public function __construct(private readonly Booking $booking) {}

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
        $this->booking->loadMissing('astrologer');

        return (new MailMessage)
            ->subject('Your booking was cancelled')
            ->greeting('Hi '.$notifiable->name.',')
            ->line('Unfortunately your consultation with '.$this->booking->astrologer->name.' scheduled for '.
                $this->booking->scheduled_at->format('l, F j, Y \a\t g:i A').' has been cancelled.')
            ->line('If you were charged, your payment will be refunded.')
            ->action('Find another astrologer', url('/customer/astrologers'));
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
            'title' => 'Booking cancelled',
            'body' => 'Consultation on '.$this->booking->scheduled_at->format('M j, Y g:i A').' was cancelled.',
            'url' => '/customer/bookings',
            'booking_id' => $this->booking->id,
        ];
    }

    /**
     * @return array<string, string|null>
     */
    public function toSms(object $notifiable): array
    {
        return [
            'to' => $notifiable->phone,
            'message' => 'Astro: your consultation on '.$this->booking->scheduled_at->format('M j g:i A').' was cancelled.',
        ];
    }
}
