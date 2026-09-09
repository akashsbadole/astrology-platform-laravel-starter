<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property UserRole $role
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read AstrologerProfile|null $astrologerProfile
 */
#[Fillable(['name', 'email', 'password', 'role', 'phone', 'locale', 'referral_code', 'referred_by_id', 'provider', 'provider_id', 'avatar'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function astrologerProfile(): HasOne
    {
        return $this->hasOne(AstrologerProfile::class);
    }

    public function availabilities(): HasMany
    {
        return $this->hasMany(AstrologerAvailability::class);
    }

    public function bookingsAsCustomer(): HasMany
    {
        return $this->hasMany(Booking::class, 'customer_id');
    }

    public function bookingsAsAstrologer(): HasMany
    {
        return $this->hasMany(Booking::class, 'astrologer_id');
    }

    public function kundlis(): HasMany
    {
        return $this->hasMany(Kundli::class);
    }

    public function poojaBookings(): HasMany
    {
        return $this->hasMany(PoojaBooking::class, 'customer_id');
    }

    public function deviceTokens(): HasMany
    {
        return $this->hasMany(DeviceToken::class);
    }

    public function notificationPreference(): HasOne
    {
        return $this->hasOne(NotificationPreference::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function forumThreads(): HasMany
    {
        return $this->hasMany(ForumThread::class);
    }

    public function forumPosts(): HasMany
    {
        return $this->hasMany(ForumPost::class);
    }

    public function referralsGiven(): HasMany
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    public function referralReceived(): HasOne
    {
        return $this->hasOne(Referral::class, 'referred_id');
    }

    public function loyaltyLedger(): HasMany
    {
        return $this->hasMany(LoyaltyLedger::class);
    }

    public function referredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_by_id');
    }

    public function loyaltyBalance(): int
    {
        return (int) $this->loyaltyLedger()->sum('points');
    }

    public function ensureReferralCode(): string
    {
        if ($this->referral_code) {
            return $this->referral_code;
        }

        do {
            $code = strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
        } while (static::where('referral_code', $code)->exists());

        $this->forceFill(['referral_code' => $code])->saveQuietly();

        return $code;
    }

    public function prefersChannel(string $channel): bool
    {
        $pref = $this->notificationPreference;
        if (! $pref) {
            return true;
        }

        return match ($channel) {
            'mail' => (bool) $pref->email_enabled,
            'sms' => (bool) $pref->sms_enabled,
            'push', 'database', 'broadcast' => (bool) $pref->push_enabled,
            default => true,
        };
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isAstrologer(): bool
    {
        return $this->role === UserRole::Astrologer;
    }

    public function isCustomer(): bool
    {
        return $this->role === UserRole::Customer;
    }
}
