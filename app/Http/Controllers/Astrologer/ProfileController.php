<?php

namespace App\Http\Controllers\Astrologer;

use App\Http\Controllers\Controller;
use App\Models\Taxonomy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $profile = $request->user()->astrologerProfile;

        return Inertia::render('astrologer/profile-edit', [
            'profile' => $profile ? [
                'bio' => $profile->bio,
                'specializations' => $profile->specializations ?? [],
                'languages' => $profile->languages ?? [],
                'experience_years' => $profile->experience_years,
                'rate_chat_per_min' => $profile->rate_chat_per_min,
                'rate_call_per_min' => $profile->rate_call_per_min,
                'rate_video_per_min' => $profile->rate_video_per_min,
                'status' => $profile->status,
            ] : null,
            'specializationOptions' => Taxonomy::activeNames('specialization'),
            'languageOptions' => Taxonomy::activeNames('language'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'bio' => ['nullable', 'string', 'max:2000'],
            'specializations' => ['nullable', 'array'],
            'specializations.*' => ['string', Rule::in(Taxonomy::activeNames('specialization'))],
            'languages' => ['nullable', 'array'],
            'languages.*' => ['string', Rule::in(Taxonomy::activeNames('language'))],
            'experience_years' => ['required', 'integer', 'min:0', 'max:80'],
            'rate_chat_per_min' => ['nullable', 'numeric', 'min:0', 'max:9999.99'],
            'rate_call_per_min' => ['nullable', 'numeric', 'min:0', 'max:9999.99'],
            'rate_video_per_min' => ['nullable', 'numeric', 'min:0', 'max:9999.99'],
        ]);

        $profile = $request->user()->astrologerProfile()->firstOrCreate([]);

        // Editing an already-approved profile re-queues it for admin review.
        $validated['status'] = $profile->status === 'approved' ? 'pending' : $profile->status;

        $profile->update($validated);

        return back()->with('status', 'profile-updated');
    }
}
