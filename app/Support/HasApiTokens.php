<?php

namespace App\Support;

use App\Models\PersonalAccessToken;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Str;

/**
 * Gives a model the ability to issue personal access tokens
 * (Sanctum-compatible "{id}|{plain}" token format).
 */
trait HasApiTokens
{
    public function tokens(): MorphMany
    {
        return $this->morphMany(PersonalAccessToken::class, 'tokenable');
    }

    /**
     * Create a new personal access token. Read `$token->plainTextToken`
     * once — it is never persisted.
     */
    public function createToken(
        string $name = 'api',
        array $abilities = ['*'],
        ?DateTimeInterface $expiresAt = null,
    ): PersonalAccessToken {
        $plain = Str::random(40);

        $token = $this->tokens()->create([
            'name' => $name,
            'token' => hash('sha256', $plain),
            'abilities' => $abilities,
            'expires_at' => $expiresAt,
        ]);

        $token->plainTextToken = $token->getKey().'|'.$plain;

        return $token;
    }
}
