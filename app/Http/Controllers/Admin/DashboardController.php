<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AstrologerProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_users' => User::count(),
                'total_customers' => User::where('role', 'customer')->count(),
                'total_astrologers' => User::where('role', 'astrologer')->count(),
                'pending_astrologers' => AstrologerProfile::pending()->count(),
                'approved_astrologers' => AstrologerProfile::approved()->count(),
            ],
        ]);
    }
}
