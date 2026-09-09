<?php

namespace App\Http\Controllers;

use App\Events\CallSignalUpdated;
use App\Events\ConsultationMessageSent;
use App\Models\CallRecording;
use App\Models\Consultation;
use App\Models\ConsultationEvent;
use App\Models\ConsultationMessage;
use App\Models\User;
use App\Services\ConsultationService;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;

class ConsultationController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $user = $request->user();
        $q = Consultation::where('customer_id', $user->id)->orWhere('astrologer_id', $user->id);
        $missed = (clone $q)->where('status', 'cancelled')->where('end_reason', 'missed')->count();
        $list = $q->latest()->paginate(15)->through(fn (Consultation $c) => [
            'id' => $c->id,
            'type' => $c->type,
            'status' => $c->status,
            'end_reason' => $c->end_reason,
            'missed_by' => $c->missed_by,
            'rate_per_min' => number_format($c->rate_per_min_paise / 100, 2),
            'billed_minutes' => round($c->billed_seconds / 60, 1),
            'amount' => number_format($c->amount_paise / 100, 2),
            'created_at' => $c->created_at->toIso8601String(),
        ]);

        $props = [
            'consultations' => $list,
            'balance' => (new WalletService)->balancePaise($user) / 100,
            'missedCount' => $missed,
        ];

        if ($request->wantsJson()) {
            return response()->json($props);
        }

        return Inertia::render('consult/index', $props);
    }

    public function store(Request $request, ConsultationService $svc): RedirectResponse|JsonResponse
    {
        $v = $request->validate([
            'astrologer_id' => ['required', 'exists:users,id'],
            'type' => ['required', 'in:chat,call,video'],
        ]);
        $astrologer = User::findOrFail($v['astrologer_id']);
        $c = $svc->request($request->user(), $astrologer, $v['type']);
        if ($request->wantsJson()) {
            return response()->json(['id' => $c->id, 'status' => $c->status]);
        }

        return redirect()->route('consult.show', $c);
    }

    public function show(Request $request, Consultation $consultation): Response|JsonResponse
    {
        abort_unless(in_array($request->user()->id, [$consultation->customer_id, $consultation->astrologer_id], true), 403);
        $consultation->load(['customer:id,name', 'astrologer:id,name']);
        $msgs = $consultation->messages()->with('sender:id,name')->oldest()->get()->map(fn (ConsultationMessage $m) => [
            'id' => $m->id, 'sender_id' => $m->sender_id, 'sender_name' => $m->sender->name, 'body' => $m->body, 'created_at' => $m->created_at->toIso8601String(),
        ]);
        $w = new WalletService;
        $balance = $w->balancePaise($request->user()->id === $consultation->customer_id ? $consultation->customer : $consultation->astrologer);

        $iceServers = [['urls' => ['stun:stun.l.google.com:19302']]];
        $turnUrls = config('services.call.turn_urls', []);
        if ($turnUrls !== []) {
            $iceServers[] = [
                'urls' => $turnUrls,
                'username' => config('services.call.turn_username'),
                'credential' => config('services.call.turn_credential'),
            ];
        }

        $props = [
            'consultation' => [
                'id' => $consultation->id,
                'type' => $consultation->type,
                'status' => $consultation->status,
                'rate_per_min' => number_format($consultation->rate_per_min_paise / 100, 2),
                'billed_seconds' => $consultation->billed_seconds,
                'amount' => number_format($consultation->amount_paise / 100, 2),
                'customer_name' => $consultation->customer->name,
                'astrologer_name' => $consultation->astrologer->name,
                'end_reason' => $consultation->end_reason,
            ],
            'messages' => $msgs,
            'currentUserId' => $request->user()->id,
            'balance' => $balance / 100,
            'minsLeft' => $w->minsLeft($balance, $consultation->rate_per_min_paise),
            'signal' => $consultation->signal ? ['channel' => $consultation->signal->channel, 'provider' => $consultation->signal->provider] : null,
            'iceServers' => $iceServers,
            'events' => $consultation->events()->latest()->limit(30)->get()->map(fn ($e) => [
                'id' => $e->id, 'kind' => $e->kind, 'actor_id' => $e->actor_id,
                'created_at' => $e->created_at->toIso8601String(), 'meta' => $e->meta,
            ])->values(),
            'recordings' => $consultation->recordings()->latest()->get()->map(fn ($r) => [
                'id' => $r->id, 'mime' => $r->mime, 'size_kb' => round($r->size_bytes / 1024, 1),
                'duration_seconds' => $r->duration_seconds, 'created_at' => $r->created_at->toIso8601String(),
                'url' => route('consult.recording.download', [$consultation, $r]),
            ])->values(),
            'missedBy' => $consultation->missed_by,
            'connectedAt' => $consultation->connected_at?->toIso8601String(),
        ];

        if ($request->wantsJson()) {
            return response()->json($props);
        }

        return Inertia::render('consult/show', $props);
    }

    public function accept(Request $request, Consultation $consultation, ConsultationService $svc): RedirectResponse|JsonResponse
    {
        $c = $svc->accept($request->user(), $consultation);
        // ensure call channel
        if (in_array($c->type, ['call', 'video'], true) && ! $c->signal) {
            $c->signal()->create(['provider' => config('services.call.provider', 'reverb'), 'channel' => 'consult-'.$c->id, 'token' => bin2hex(random_bytes(16))]);
        }
        if ($request->wantsJson()) {
            return response()->json(['status' => $c->status]);
        }

        return back();
    }

    public function heartbeat(Request $request, Consultation $consultation, ConsultationService $svc): JsonResponse
    {
        $v = $request->validate(['seconds' => ['required', 'integer', 'min:5', 'max:120']]);
        $out = $svc->heartbeat($request->user(), $consultation, $v['seconds']);

        return response()->json([
            'status' => $out['consultation']->status,
            'billed_seconds' => $out['consultation']->billed_seconds,
            'amount' => $out['consultation']->amount_paise / 100,
            'balance' => $out['balance_paise'] / 100,
            'mins_left' => $out['mins_left'],
            'low' => $out['low'] ?? false,
            'ended' => $out['ended'] ?? $out['consultation']->status === 'ended',
        ]);
    }

    public function end(Request $request, Consultation $consultation, ConsultationService $svc): RedirectResponse|JsonResponse
    {
        abort_unless(in_array($request->user()->id, [$consultation->customer_id, $consultation->astrologer_id], true), 403);
        $out = $svc->end($consultation, 'completed');
        if ($request->wantsJson()) {
            return response()->json(['status' => 'ended']);
        }

        return back();
    }

    public function sendMessage(Request $request, Consultation $consultation): JsonResponse
    {
        abort_unless(in_array($request->user()->id, [$consultation->customer_id, $consultation->astrologer_id], true), 403);
        abort_unless($consultation->status === 'active', 422, 'Session not active.');
        $v = $request->validate(['body' => ['required', 'string', 'max:2000']]);
        $m = $consultation->messages()->create(['sender_id' => $request->user()->id, 'body' => $v['body']]);
        $m->load('sender:id,name');
        broadcast(new ConsultationMessageSent($m))->toOthers();

        return response()->json(['id' => $m->id, 'sender_id' => $m->sender_id, 'sender_name' => $m->sender->name, 'body' => $m->body, 'created_at' => $m->created_at->toIso8601String()]);
    }

    public function signal(Request $request, Consultation $consultation): JsonResponse
    {
        abort_unless(in_array($request->user()->id, [$consultation->customer_id, $consultation->astrologer_id], true), 403);
        abort_unless(in_array($consultation->type, ['call', 'video'], true), 422, 'Signaling only for call/video.');
        abort_unless($consultation->status === 'active', 422, 'Session not active.');
        $v = $request->validate([
            'kind' => ['required', 'in:offer,answer,ice,leave'],
            'sdp' => ['nullable', 'string', 'max:20000'],
            'candidate' => ['nullable', 'string', 'max:5000'],
        ]);

        $signal = $consultation->signal()->firstOrCreate(
            ['consultation_id' => $consultation->id],
            ['provider' => config('services.call.provider', 'reverb'), 'channel' => 'consult-'.$consultation->id]
        );
        $payload = $signal->payload ?? [];
        $payload[$v['kind'].'_'.now()->timestamp.'_'.$request->user()->id] = [
            'from' => $request->user()->id,
            'sdp' => $v['sdp'] ?? null,
            'candidate' => $v['candidate'] ?? null,
        ];
        $signal->update(['payload' => $payload]);

        broadcast(new CallSignalUpdated($signal->fresh(), $v['kind'], [
            'from' => $request->user()->id,
            'sdp' => $v['sdp'] ?? null,
            'candidate' => $v['candidate'] ?? null,
        ]))->toOthers();

        ConsultationEvent::create([
            'consultation_id' => $consultation->id, 'actor_id' => $request->user()->id,
            'kind' => 'signal', 'meta' => ['signal' => $v['kind']],
        ]);

        return response()->json(['ok' => true]);
    }

    public function storeRecording(Request $request, Consultation $consultation): JsonResponse
    {
        abort_unless(in_array($request->user()->id, [$consultation->customer_id, $consultation->astrologer_id], true), 403);
        $v = $request->validate([
            'recording' => ['required', 'file', 'max:51200', 'mimetypes:audio/webm,video/webm,audio/mpeg,audio/mp4,video/mp4'],
            'duration_seconds' => ['nullable', 'integer', 'min:1', 'max:14400'],
        ]);

        $path = $v['recording']->store('recordings/'.$consultation->id, 'local');
        $rec = CallRecording::create([
            'consultation_id' => $consultation->id,
            'user_id' => $request->user()->id,
            'path' => $path,
            'disk' => 'local',
            'mime' => $v['recording']->getMimeType(),
            'size_bytes' => $v['recording']->getSize() ?? 0,
            'duration_seconds' => $v['duration_seconds'] ?? null,
            'status' => 'ready',
        ]);
        ConsultationEvent::create([
            'consultation_id' => $consultation->id, 'actor_id' => $request->user()->id,
            'kind' => 'recording', 'meta' => ['recording_id' => $rec->id],
        ]);

        return response()->json(['id' => $rec->id, 'size_kb' => round($rec->size_bytes / 1024, 1)]);
    }

    public function downloadRecording(Request $request, Consultation $consultation, CallRecording $recording)
    {
        abort_unless($recording->consultation_id === $consultation->id, 404);
        abort_unless(in_array($request->user()->id, [$consultation->customer_id, $consultation->astrologer_id], true) || $request->user()->isAdmin(), 403);

        return Storage::disk($recording->disk)->download($recording->path);
    }
}
