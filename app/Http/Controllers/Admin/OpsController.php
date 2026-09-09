<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AstrologerEarning;
use App\Models\Banner;
use App\Models\Coupon;
use App\Models\Dispute;
use App\Models\Horoscope;
use App\Models\LiveSession;
use App\Models\Order;
use App\Models\Payout;
use App\Models\Product;
use App\Models\Refund;
use App\Models\Shipment;
use App\Models\SupportTicket;
use App\Models\User;
use App\Notifications\ShipmentUpdated;
use App\Services\PayoutService;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;

class OpsController extends Controller
{
    public function dashboard(): Response|JsonResponse
    {
        $gross = AstrologerEarning::sum('gross_paise') / 100;
        $commission = AstrologerEarning::sum('commission_paise') / 100;

        $payload = [
            'stats' => [
                'gross' => $gross, 'commission' => $commission,
                'orders' => Order::count(), 'payouts_pending' => Payout::where('status', 'requested')->count(),
                'refunds_open' => Refund::where('status', 'requested')->count(),
                'disputes_open' => Dispute::where('status', 'open')->count(),
                'tickets_open' => SupportTicket::where('status', 'open')->count(),
            ],
        ];

        if (request()->wantsJson()) {
            return response()->json($payload);
        }

        return Inertia::render('admin/ops/dashboard', $payload);
    }

    public function coupons(): Response
    {
        return Inertia::render('admin/ops/coupons', ['coupons' => Coupon::latest()->paginate(20)]);
    }

    public function storeCoupon(Request $request): RedirectResponse
    {
        $v = $request->validate(['code' => 'required|string|max:30|unique:coupons,code', 'type' => 'required|in:flat,percent,first_free,recharge_bonus', 'value_paise' => 'required|integer|min:0']);
        $v['code'] = strtoupper($v['code']);
        Coupon::create($v);

        return back();
    }

    public function payouts(): Response
    {
        return Inertia::render('admin/ops/payouts', ['payouts' => Payout::latest()->paginate(20), 'earnings' => AstrologerEarning::latest()->limit(20)->get()]);
    }

    public function approvePayout(Payout $payout, PayoutService $payouts): RedirectResponse
    {
        $payouts->process($payout);

        return back();
    }

    public function refunds(): Response
    {
        return Inertia::render('admin/ops/refunds', ['refunds' => Refund::latest()->paginate(20)]);
    }

    public function processRefund(Request $request, Refund $refund, WalletService $wallets): RedirectResponse
    {
        $refund->update(['status' => 'processed']);
        $user = User::find($refund->user_id);
        if ($user) {
            $wallets->credit($user, $refund->amount_paise, WalletService::newKey('refund-'.$refund->id), $refund, 'refund', []);
        }

        return back();
    }

    public function disputes(): Response
    {
        return Inertia::render('admin/ops/disputes', ['disputes' => Dispute::latest()->paginate(20)]);
    }

    public function resolveDispute(Request $request, Dispute $dispute): RedirectResponse
    {
        $v = $request->validate(['resolution' => 'required|string|max:2000']);
        $dispute->update(['status' => 'resolved', 'resolution' => $v['resolution']]);

        return back();
    }

    public function horoscopes(): Response
    {
        return Inertia::render('admin/ops/horoscopes', ['items' => Horoscope::latest()->paginate(30)]);
    }

    public function storeHoroscope(Request $request): RedirectResponse
    {
        $v = $request->validate(['rashi' => 'required|string', 'period' => 'required|in:daily,weekly,monthly,yearly', 'date' => 'nullable|date', 'title' => 'nullable|string|max:255', 'body' => 'required|string']);
        Horoscope::updateOrCreate(['rashi' => $v['rashi'], 'period' => $v['period'], 'date' => $v['date'] ?? null], $v);

        return back();
    }

    public function products(): Response
    {
        return Inertia::render('admin/ops/products', ['products' => Product::latest()->paginate(20)]);
    }

    public function storeProduct(Request $request): RedirectResponse
    {
        $v = $request->validate(['name' => 'required|string|max:255', 'price' => 'required|numeric|min:1', 'stock' => 'nullable|integer|min:0', 'description' => 'nullable|string']);
        Product::create(['slug' => \Str::slug($v['name']).'-'.time(), 'name' => $v['name'], 'price_paise' => (int) round($v['price'] * 100), 'stock' => $v['stock'] ?? 0, 'description' => $v['description'] ?? null, 'is_active' => true]);

        return back();
    }

    public function live(): Response
    {
        return Inertia::render('admin/ops/live', ['sessions' => LiveSession::latest()->paginate(20)]);
    }

    public function storeLive(Request $request): RedirectResponse
    {
        $v = $request->validate(['astrologer_id' => 'required|exists:users,id', 'title' => 'required|string|max:255', 'starts_at' => 'nullable|date', 'entry_fee' => 'nullable|numeric|min:0']);
        LiveSession::create(['astrologer_id' => $v['astrologer_id'], 'title' => $v['title'], 'status' => 'scheduled', 'starts_at' => $v['starts_at'] ?? null, 'entry_fee_paise' => (int) round(($v['entry_fee'] ?? 0) * 100), 'room_id' => 'live-'.time()]);

        return back();
    }

    public function goLive(LiveSession $liveSession): RedirectResponse
    {
        $liveSession->update(['status' => $liveSession->status === 'live' ? 'ended' : 'live', 'ended_at' => $liveSession->status === 'live' ? now() : null]);

        return back();
    }

    public function banners(): Response
    {
        return Inertia::render('admin/ops/banners', ['banners' => Banner::orderBy('sort')->get()]);
    }

    public function storeBanner(Request $request): RedirectResponse
    {
        $v = $request->validate(['title' => 'nullable|string|max:255', 'link' => 'nullable|string|max:500', 'slot' => 'nullable|string|max:50']);
        Banner::create(['title' => $v['title'] ?? null, 'link' => $v['link'] ?? null, 'slot' => $v['slot'] ?? 'home', 'is_active' => true]);

        return back();
    }

    public function support(): Response
    {
        return Inertia::render('admin/ops/support', ['tickets' => SupportTicket::latest()->paginate(20)]);
    }

    public function shipments(): Response
    {
        return Inertia::render('admin/ops/shipments', [
            'orders' => Order::with('user:id,name')->latest()->paginate(20)->through(fn (Order $o) => [
                'id' => $o->id, 'customer' => $o->user->name ?? '#'.$o->user_id,
                'status' => $o->status, 'shipping_status' => $o->shipping_status,
                'tracking_number' => $o->tracking_number, 'carrier' => $o->carrier,
                'total' => $o->total_paise / 100,
            ]),
        ]);
    }

    public function updateShipment(Request $request, Order $order): RedirectResponse
    {
        $v = $request->validate([
            'shipping_status' => ['required', 'in:pending,packed,shipped,in_transit,delivered,cancelled'],
            'carrier' => ['nullable', 'string', 'max:100'],
            'tracking_number' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $order->update([
            'shipping_status' => $v['shipping_status'],
            'carrier' => $v['carrier'] ?? $order->carrier,
            'tracking_number' => $v['tracking_number'] ?? $order->tracking_number,
            'shipped_at' => in_array($v['shipping_status'], ['shipped', 'in_transit', 'delivered'], true) ? ($order->shipped_at ?? now()) : $order->shipped_at,
            'delivered_at' => $v['shipping_status'] === 'delivered' ? now() : $order->delivered_at,
        ]);
        Shipment::create([
            'order_id' => $order->id, 'status' => $v['shipping_status'],
            'carrier' => $v['carrier'] ?? null, 'tracking_number' => $v['tracking_number'] ?? null,
            'note' => $v['note'] ?? null,
        ]);
        $order->user->notify(new ShipmentUpdated($order->fresh()));

        return back()->with('status', 'Shipment updated.');
    }
}
