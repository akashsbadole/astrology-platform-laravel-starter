<?php

namespace App\Enums;

enum UserRole: string
{
    case Customer = 'customer';
    case Astrologer = 'astrologer';
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Customer => 'Customer',
            self::Astrologer => 'Astrologer',
            self::Admin => 'Admin',
        };
    }

    /**
     * Roles a person may pick for themselves during registration.
     *
     * @return array<int, self>
     */
    public static function selectable(): array
    {
        return [self::Customer, self::Astrologer];
    }
}
