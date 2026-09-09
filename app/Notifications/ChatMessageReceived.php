<?php

namespace App\Notifications;

use App\Notifications\Channels\PushChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ChatMessageReceived extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $senderName,
        private readonly string $excerpt,
        private readonly string $url,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', PushChannel::class];
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
            'title' => 'New message from '.$this->senderName,
            'body' => mb_strimwidth($this->excerpt, 0, 120, '…'),
            'url' => $this->url,
        ];
    }
}
