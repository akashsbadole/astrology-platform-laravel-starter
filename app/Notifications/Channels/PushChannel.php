<?php

namespace App\Notifications\Channels;

use App\Events\NotificationSent;
use Illuminate\Notifications\Notification;

class PushChannel
{
    public function send(object $notifiable, Notification $notification): void
    {
        if (method_exists($notifiable, 'prefersChannel') && ! $notifiable->prefersChannel('push')) {
            return;
        }

        if (! method_exists($notification, 'toPush')) {
            return;
        }

        $payload = $notification->toPush($notifiable);

        // NOTE: persistence is handled by the `database` channel. Push only
        // broadcasts in real time to avoid duplicate notification rows.
        broadcast(new NotificationSent($notifiable->id, $payload))->toOthers();
    }
}
