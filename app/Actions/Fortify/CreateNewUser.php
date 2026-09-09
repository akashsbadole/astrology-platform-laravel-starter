<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Enums\UserRole;
use App\Models\User;
use App\Services\ReferralService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $selectableRoles = array_map(fn (UserRole $role) => $role->value, UserRole::selectable());

        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'role' => ['sometimes', 'string', Rule::in($selectableRoles)],
            'phone' => ['nullable', 'string', 'max:20', 'unique:users,phone'],
            'referral_code_input' => ['nullable', 'string', 'max:16'],
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'role' => $input['role'] ?? UserRole::Customer->value,
            'phone' => $input['phone'] ?? null,
            'locale' => $input['locale'] ?? session('locale', 'en'),
        ]);
        $user->ensureReferralCode();

        if (! empty($input['referral_code_input'] ?? null) || session('referral_code')) {
            app(ReferralService::class)->attach(
                $user,
                $input['referral_code_input'] ?? session('referral_code')
            );
        }

        if ($user->role === UserRole::Astrologer) {
            $user->astrologerProfile()->create([
                'status' => 'pending',
            ]);
        }

        return $user;
    }
}
