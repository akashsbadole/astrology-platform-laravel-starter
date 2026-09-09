<?php

namespace App\Http\Controllers\Astrologer;

use App\Http\Controllers\Controller;
use App\Models\AstrologerStatus;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;

class StatusController extends Controller
{
    public function update(Request $request): RedirectResponse|JsonResponse
    {
        $v = $request->validate(['is_online' => 'required|boolean', 'accepts_chat' => 'nullable|boolean', 'accepts_call' => 'nullable|boolean', 'accepts_video' => 'nullable|boolean']);
        $st = AstrologerStatus::firstOrNew(['user_id' => $request->user()->id]);
        $st->fill(['is_online' => $v['is_online'], 'accepts_chat' => $v['accepts_chat'] ?? $st->accepts_chat ?? true, 'accepts_call' => $v['accepts_call'] ?? $st->accepts_call ?? true, 'accepts_video' => $v['accepts_video'] ?? $st->accepts_video ?? false, 'last_seen_at' => now()]);
        $st->save();
        $request->user()->astrologerProfile?->update(['is_online' => $st->is_online, 'accepts_chat' => $st->accepts_chat, 'accepts_call' => $st->accepts_call, 'accepts_video' => $st->accepts_video, 'last_seen_at' => now()]);
        if ($request->wantsJson()) {
            return response()->json(['ok' => true, 'is_online' => $st->is_online]);
        }

        return back();
    }
}
