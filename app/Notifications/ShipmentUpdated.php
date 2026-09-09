<?php

namespace App\Notifications;

use App\Models\Order;
use App\Notifications\Channels\PushChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ShipmentUpdated extends Notification
{
    use Queueable;

    public function __construct(private readonly Order $order) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['mail', 'database', PushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $tracking = $this->order->tracking_number ? ' Tracking: '.$this->order->tracking_number.($this->order->carrier ? ' ('.$this->order->carrier.')' : '') : '';

        return (new MailMessage)
            ->subject('Order #'.$this->order->id.' — '.$this->order->shipping_status)
            ->greeting('Hi '.$notifiable->name.',')
            ->line('Your order #'.$this->order->id.' is now: '.$this->order->shipping_status.'.'.$tracking)
            ->action('Track order', url('/shop/orders/'.$this->order->id));
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return $this->toPush($notifiable);
    }

    /** @return array<string, mixed> */
    public function toPush(object $notifiable): array
    {
        return [
            'title' => 'Order #'.$this->order->id.' '.$this->order->shipping_status,
            'body' => $this->order->tracking_number ? 'Tracking: '.$this->order->tracking_number : 'Status updated.',
            'url' => '/shop/orders/'.$this->order->id,
            'order_id' => $this->order->id,
        ];
    }
}
