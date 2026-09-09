<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Notifications\Channels\PushChannel;
use App\Notifications\Channels\SmsChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingConfirmed extends Notification
{
    use Queueable;

    public function __construct(private readonly Booking $booking, private readonly bool $forAstrologer) {}

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
        $this->booking->loadMissing(['customer', 'astrologer']);

        $otherParty = $this->forAstrologer ? $this->booking->customer : $this->booking->astrologer;
        $greetingName = $this->forAstrologer ? 'you have a new booking' : 'your booking is confirmed';

        return (new MailMessage)
            ->subject('Booking confirmed - '.$this->booking->scheduled_at->format('M j, Y g:i A'))
            ->greeting('Hi '.$notifiable->name.',')
            ->line("Great news, {$greetingName}!")
            ->line('With: '.$otherParty->name)
            ->line('Type: '.ucfirst($this->booking->consultation_type->value))
            ->line('When: '.$this->booking->scheduled_at->format('l, F j, Y \a\t g:i A'))
            ->line('Duration: '.$this->booking->duration_minutes.' minutes')
            ->action('View booking', url('/customer/bookings'))
            ->line('The chat opens automatically once the session begins.');
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
            'title' => $this->forAstrologer ? 'New booking received' : 'Booking confirmed',
            'body' => 'Consultation on '.$this->booking->scheduled_at->format('M j, Y g:i A'),
            'url' => $this->forAstrologer ? '/astrologer/bookings' : '/customer/bookings',
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
            'message' => 'Astro: your consultation on '.$this->booking->scheduled_at->format('M j g:i A').' is confirmed. Chat opens 15 min before.',
        ];
    }
}
