<?php

namespace App\Enums;

enum ConsultationType: string
{
    case Chat = 'chat';
    case Call = 'call';
    case Video = 'video';

    public function label(): string
    {
        return match ($this) {
            self::Chat => 'Chat',
            self::Call => 'Call',
            self::Video => 'Video',
        };
    }
}
