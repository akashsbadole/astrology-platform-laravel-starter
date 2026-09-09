<?php

namespace App\Http\Controllers;

use App\Events\LiveGiftSent;
use App\Events\LiveMessageSent;
use App\Models\AstrologerEarning;
use App\Models\LiveGift;
use App\Models\LiveMessage;
use App\Models\LiveSession;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;

class LiveController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('live/index', [
            'live' => LiveSession::where('status', 'live')->with('astrologer:id,name')->latest()->get(),
            'upcoming' => LiveSession::where('status', 'scheduled')->orderBy('starts_at')->limit(10)->with('astrologer:id,name')->get(),
        ]);
    }

    public function show(LiveSession $liveSession): Response
    {
        $messages = LiveMessage::where('live_session_id', $liveSession->id)->with('sender:id,name')->latest()->limit(50)->get()->reverse()->values()->map(fn (LiveMessage $m) => [
            'id' => $m->id, 'sender_name' => $m->sender->name, 'body' => $m->body,
        ]);

        return Inertia::render('live/show', [
            'session' => [
                'id' => $liveSession->id, 'title' => $liveSession->title, 'description' => $liveSession->description,
                'status' => $liveSession->status, 'entry_fee' => $liveSession->entry_fee_paise / 100,
                'astrologer_name' => $liveSession->astrologer->name,
            ],
            'isParticipant' => $liveSession->participants()->where('user_id', request()->user()?->id)->exists(),
            'messages' => $messages,
        ]);
    }

    public function join(Request $request, LiveSession $liveSession, WalletService $wallets): RedirectResponse|JsonResponse
    {
        if ($liveSession->entry_fee_paise > 0) {
            $wallets->debit($request->user(), $liveSession->entry_fee_paise, WalletService::newKey('live-'.$liveSession->id.'-'.$request->user()->id), $liveSession, 'debit', []);
        }
        $liveSession->participants()->firstOrCreate(['user_id' => $request->user()->id], ['joined_at' => now()]);
        if ($request->wantsJson()) {
            return response()->json(['ok' => true]);
        }

        return back();
    }

    public function gift(Request $request, LiveSession $liveSession, WalletService $wallets): JsonResponse
    {
        $v = $request->validate(['gift' => 'required|string|max:50', 'amount' => 'required|numeric|min:1|max:10000']);
        $paise = (int) round($v['amount'] * 100);
        $wallets->debit($request->user(), $paise, WalletService::newKey('gift-'.$liveSession->id.'-'.time()), $liveSession, 'debit', ['gift' => $v['gift']]);
        $g = LiveGift::create(['live_session_id' => $liveSession->id, 'sender_id' => $request->user()->id, 'gift' => $v['gift'], 'amount_paise' => $paise]);
        AstrologerEarning::create(['astrologer_id' => $liveSession->astrologer_id, 'reference_type' => LiveGift::class, 'reference_id' => $g->id, 'gross_paise' => $paise, 'commission_paise' => (int) round($paise * 0.25), 'net_paise' => $paise - (int) round($paise * 0.25), 'status' => 'payable']);
        broadcast(new LiveGiftSent($g))->toOthers();

        return response()->json(['ok' => true]);
    }

    public function message(Request $request, LiveSession $liveSession): JsonResponse
    {
        abort_unless($liveSession->participants()->where('user_id', $request->user()->id)->exists() || $request->user()->id === $liveSession->astrologer_id, 403);
        $v = $request->validate(['body' => ['required', 'string', 'max:500']]);
        $m = LiveMessage::create(['live_session_id' => $liveSession->id, 'sender_id' => $request->user()->id, 'body' => $v['body']]);
        $m->load('sender:id,name');
        broadcast(new LiveMessageSent($m))->toOthers();

        return response()->json(['id' => $m->id, 'sender_name' => $m->sender->name, 'body' => $m->body]);
    }
}
