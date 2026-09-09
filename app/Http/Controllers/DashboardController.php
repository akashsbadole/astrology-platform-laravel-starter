<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $role = $request->user()->role ?? UserRole::Customer;

        return match ($role) {
            UserRole::Admin => redirect()->route('admin.dashboard'),
            UserRole::Astrologer => redirect()->route('astrologer.dashboard'),
            default => redirect()->route('customer.dashboard'),
        };
    }
}
