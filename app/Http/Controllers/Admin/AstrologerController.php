<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AstrologerProfile;
use App\Notifications\AstrologerApplicationApproved;
use App\Notifications\AstrologerApplicationRejected;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AstrologerController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString() ?: null;

        $astrologers = AstrologerProfile::query()
            ->with('user:id,name,email')
            ->when($status, fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (AstrologerProfile $profile) => [
                'id' => $profile->id,
                'name' => $profile->user->name,
                'email' => $profile->user->email,
                'status' => $profile->status,
                'experience_years' => $profile->experience_years,
                'specializations' => $profile->specializations ?? [],
                'created_at' => $profile->created_at?->diffForHumans(),
            ]);

        return Inertia::render('admin/astrologers/index', [
            'astrologers' => $astrologers,
            'filters' => ['status' => $status],
        ]);
    }

    public function approve(AstrologerProfile $astrologer): RedirectResponse
    {
        $astrologer->update([
            'status' => 'approved',
            'rejection_reason' => null,
            'approved_at' => now(),
        ]);

        $astrologer->loadMissing('user');
        $astrologer->user->notify(new AstrologerApplicationApproved);

        return back()->with('status', 'astrologer-approved');
    }

    public function reject(Request $request, AstrologerProfile $astrologer): RedirectResponse
    {
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $astrologer->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'approved_at' => null,
        ]);

        $astrologer->loadMissing('user');
        $astrologer->user->notify(new AstrologerApplicationRejected($validated['rejection_reason']));

        return back()->with('status', 'astrologer-rejected');
    }
}
