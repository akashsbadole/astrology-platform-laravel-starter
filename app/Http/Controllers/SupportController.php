<?php

namespace App\Http\Controllers;

use App\Models\Dispute;
use App\Models\Refund;
use App\Models\SupportTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;

class SupportController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $payload = [
            'tickets' => SupportTicket::where('user_id', $request->user()->id)->latest()->paginate(15),
            'disputes' => Dispute::where('user_id', $request->user()->id)->latest()->paginate(15),
        ];

        if ($request->wantsJson()) {
            return response()->json($payload);
        }

        return Inertia::render('support/index', $payload);
    }

    public function storeTicket(Request $request): RedirectResponse|JsonResponse
    {
        $v = $request->validate(['subject' => 'required|string|max:255', 'body' => 'nullable|string|max:5000']);
        $ticket = SupportTicket::create(['user_id' => $request->user()->id, 'subject' => $v['subject'], 'body' => $v['body'] ?? null, 'status' => 'open']);

        if ($request->wantsJson()) {
            return response()->json(['id' => $ticket->id, 'status' => $ticket->status]);
        }

        return back()->with('status', 'Ticket raised.');
    }

    public function storeDispute(Request $request): RedirectResponse|JsonResponse
    {
        $v = $request->validate(['subject' => 'required|string|max:255', 'description' => 'nullable|string|max:5000', 'reference_type' => 'nullable|string', 'reference_id' => 'nullable|integer']);
        $dispute = Dispute::create(['user_id' => $request->user()->id, 'subject' => $v['subject'], 'description' => $v['description'] ?? null, 'reference_type' => $v['reference_type'] ?? null, 'reference_id' => $v['reference_id'] ?? null, 'status' => 'open']);

        if ($request->wantsJson()) {
            return response()->json(['id' => $dispute->id, 'status' => $dispute->status]);
        }

        return back()->with('status', 'Dispute raised.');
    }

    public function requestRefund(Request $request): RedirectResponse|JsonResponse
    {
        $v = $request->validate(['amount' => 'required|numeric|min:1', 'reason' => 'nullable|string|max:1000']);
        $refund = Refund::create(['user_id' => $request->user()->id, 'amount_paise' => (int) round($v['amount'] * 100), 'reason' => $v['reason'] ?? null, 'status' => 'requested']);

        if ($request->wantsJson()) {
            return response()->json(['id' => $refund->id, 'status' => $refund->status]);
        }

        return back()->with('status', 'Refund requested.');
    }
}
