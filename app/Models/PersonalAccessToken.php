<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Personal access token for API authentication (Sanctum-style, self-contained).
 * Token format: "{id}|{plain-text}" — only the SHA-256 hash of the plain text is stored.
 *
 * @property int $id
 * @property string $name
 * @property string $token
 * @property array|null $abilities
 * @property \Illuminate\Support\Carbon|null $last_used_at
 * @property \Illuminate\Support\Carbon|null $expires_at
 * @property string|null $plainTextToken
 */
class PersonalAccessToken extends Model
{
    protected $fillable = ['name', 'token', 'abilities', 'expires_at'];

    protected $hidden = ['token', 'tokenable_type', 'tokenable_id'];

    protected function casts(): array
    {
        return [
            'abilities' => 'array',
            'last_used_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function tokenable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Find a token instance by the "{id}|{plain-text}" bearer value.
     */
    public static function findToken(string $token): ?self
    {
        if (! str_contains($token, '|')) {
            return null;
        }

        [$id, $tokenValue] = explode('|', $token, 2);

        $instance = static::query()->find((int) $id);

        if (! $instance || ! hash_equals($instance->token, hash('sha256', $tokenValue))) {
            return null;
        }

        return $instance;
    }

    public function can(string $ability): bool
    {
        return in_array('*', $this->abilities ?? [], true);
    }

    public function cant(string $ability): bool
    {
        return ! $this->can($ability);
    }
}
