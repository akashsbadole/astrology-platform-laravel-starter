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

    public function coupons(): Response|JsonResponse
    {
        $coupons = Coupon::latest()->paginate(20);

        if (request()->wantsJson()) {
            return response()->json(['coupons' => $coupons->items(), 'total' => $coupons->total(), 'current_page' => $coupons->currentPage(), 'last_page' => $coupons->lastPage()]);
        }

        return Inertia::render('admin/ops/coupons', ['coupons' => $coupons]);
    }

    public function storeCoupon(Request $request): RedirectResponse|JsonResponse
    {
        $v = $request->validate(['code' => 'required|string|max:30|unique:coupons,code', 'type' => 'required|in:flat,percent,first_free,recharge_bonus', 'value_paise' => 'required|integer|min:0']);
        $v['code'] = strtoupper($v['code']);
        $coupon = Coupon::create($v);

        if ($request->wantsJson()) {
            return response()->json(['ok' => true, 'coupon' => $coupon]);
        }

        return back();
    }

    public function payouts(): Response|JsonResponse
    {
        $payouts = Payout::latest()->paginate(20);
        $earnings = AstrologerEarning::latest()->limit(20)->get();

        if (request()->wantsJson()) {
            return response()->json(['payouts' => $payouts->items(), 'earnings' => $earnings]);
        }

        return Inertia::render('admin/ops/payouts', ['payouts' => $payouts, 'earnings' => $earnings]);
    }

    public function approvePayout(Payout $payout, PayoutService $payouts): RedirectResponse|JsonResponse
    {
        $payouts->process($payout);

        if (request()->wantsJson()) {
            return response()->json(['ok' => true]);
        }

        return back();
    }

    public function refunds(): Response|JsonResponse
    {
        $refunds = Refund::latest()->paginate(20);

        if (request()->wantsJson()) {
            return response()->json(['refunds' => $refunds->items(), 'total' => $refunds->total(), 'current_page' => $refunds->currentPage(), 'last_page' => $refunds->lastPage()]);
        }

        return Inertia::render('admin/ops/refunds', ['refunds' => $refunds]);
    }

    public function processRefund(Request $request, Refund $refund, WalletService $wallets): RedirectResponse|JsonResponse
    {
        $refund->update(['status' => 'processed']);
        $user = User::find($refund->user_id);
        if ($user) {
            $wallets->credit($user, $refund->amount_paise, WalletService::newKey('refund-'.$refund->id), $refund, 'refund', []);
        }

        if ($request->wantsJson()) {
            return response()->json(['ok' => true]);
        }

        return back();
    }

    public function disputes(): Response|JsonResponse
    {
        $disputes = Dispute::latest()->paginate(20);

        if (request()->wantsJson()) {
            return response()->json(['disputes' => $disputes->items(), 'total' => $disputes->total(), 'current_page' => $disputes->currentPage(), 'last_page' => $disputes->lastPage()]);
        }

        return Inertia::render('admin/ops/disputes', ['disputes' => $disputes]);
    }

    public function resolveDispute(Request $request, Dispute $dispute): RedirectResponse|JsonResponse
    {
        $v = $request->validate(['resolution' => 'required|string|max:2000']);
        $dispute->update(['status' => 'resolved', 'resolution' => $v['resolution']]);

        if ($request->wantsJson()) {
            return response()->json(['ok' => true]);
        }

        return back();
    }

    public function horoscopes(): Response|JsonResponse
    {
        $items = Horoscope::latest()->paginate(30);

        if (request()->wantsJson()) {
            return response()->json(['items' => $items->items(), 'total' => $items->total(), 'current_page' => $items->currentPage(), 'last_page' => $items->lastPage()]);
        }

        return Inertia::render('admin/ops/horoscopes', ['items' => $items]);
    }

    public function storeHoroscope(Request $request): RedirectResponse|JsonResponse
    {
        $v = $request->validate(['rashi' => 'required|string', 'period' => 'required|in:daily,weekly,monthly,yearly', 'date' => 'nullable|date', 'title' => 'nullable|string|max:255', 'body' => 'required|string']);
        $horoscope = Horoscope::updateOrCreate(['rashi' => $v['rashi'], 'period' => $v['period'], 'date' => $v['date'] ?? null], $v);

        if ($request->wantsJson()) {
            return response()->json(['ok' => true, 'horoscope' => $horoscope]);
        }

        return back();
    }

    public function products(): Response|JsonResponse
    {
        $products = Product::latest()->paginate(20);

        if (request()->wantsJson()) {
            return response()->json(['products' => $products->items(), 'total' => $products->total(), 'current_page' => $products->currentPage(), 'last_page' => $products->lastPage()]);
        }

        return Inertia::render('admin/ops/products', ['products' => $products]);
    }

    public function storeProduct(Request $request): RedirectResponse|JsonResponse
    {
        $v = $request->validate(['name' => 'required|string|max:255', 'price' => 'required|numeric|min:1', 'stock' => 'nullable|integer|min:0', 'description' => 'nullable|string']);
        $product = Product::create(['slug' => \Str::slug($v['name']).'-'.time(), 'name' => $v['name'], 'price_paise' => (int) round($v['price'] * 100), 'stock' => $v['stock'] ?? 0, 'description' => $v['description'] ?? null, 'is_active' => true]);

        if ($request->wantsJson()) {
            return response()->json(['ok' => true, 'product' => $product]);
        }

        return back();
    }

    public function live(): Response|JsonResponse
    {
        $sessions = LiveSession::latest()->paginate(20);

        if (request()->wantsJson()) {
            return response()->json(['sessions' => $sessions->items(), 'total' => $sessions->total(), 'current_page' => $sessions->currentPage(), 'last_page' => $sessions->lastPage()]);
        }

        return Inertia::render('admin/ops/live', ['sessions' => $sessions]);
    }

    public function storeLive(Request $request): RedirectResponse|JsonResponse
    {
        $v = $request->validate(['astrologer_id' => 'required|exists:users,id', 'title' => 'required|string|max:255', 'starts_at' => 'nullable|date', 'entry_fee' => 'nullable|numeric|min:0']);
        $session = LiveSession::create(['astrologer_id' => $v['astrologer_id'], 'title' => $v['title'], 'status' => 'scheduled', 'starts_at' => $v['starts_at'] ?? null, 'entry_fee_paise' => (int) round(($v['entry_fee'] ?? 0) * 100), 'room_id' => 'live-'.time()]);

        if ($request->wantsJson()) {
            return response()->json(['ok' => true, 'session' => $session]);
        }

        return back();
    }

    public function goLive(LiveSession $liveSession): RedirectResponse|JsonResponse
    {
        $liveSession->update(['status' => $liveSession->status === 'live' ? 'ended' : 'live', 'ended_at' => $liveSession->status === 'live' ? now() : null]);

        if (request()->wantsJson()) {
            return response()->json(['ok' => true, 'status' => $liveSession->status]);
        }

        return back();
    }

    public function banners(): Response|JsonResponse
    {
        $banners = Banner::orderBy('sort')->get();

        if (request()->wantsJson()) {
            return response()->json(['banners' => $banners]);
        }

        return Inertia::render('admin/ops/banners', ['banners' => $banners]);
    }

    public function storeBanner(Request $request): RedirectResponse|JsonResponse
    {
        $v = $request->validate(['title' => 'nullable|string|max:255', 'link' => 'nullable|string|max:500', 'slot' => 'nullable|string|max:50']);
        $banner = Banner::create(['title' => $v['title'] ?? null, 'link' => $v['link'] ?? null, 'slot' => $v['slot'] ?? 'home', 'is_active' => true]);

        if ($request->wantsJson()) {
            return response()->json(['ok' => true, 'banner' => $banner]);
        }

        return back();
    }

    public function support(): Response|JsonResponse
    {
        $tickets = SupportTicket::latest()->paginate(20);

        if (request()->wantsJson()) {
            return response()->json(['tickets' => $tickets->items(), 'total' => $tickets->total(), 'current_page' => $tickets->currentPage(), 'last_page' => $tickets->lastPage()]);
        }

        return Inertia::render('admin/ops/support', ['tickets' => $tickets]);
    }

    public function shipments(): Response|JsonResponse
    {
        $orders = Order::with('user:id,name')->latest()->paginate(20)->through(fn (Order $o) => [
            'id' => $o->id, 'customer' => $o->user->name ?? '#'.$o->user_id,
            'status' => $o->status, 'shipping_status' => $o->shipping_status,
            'tracking_number' => $o->tracking_number, 'carrier' => $o->carrier,
            'total' => $o->total_paise / 100,
        ]);

        if (request()->wantsJson()) {
            return response()->json(['orders' => $orders->items(), 'total' => $orders->total(), 'current_page' => $orders->currentPage(), 'last_page' => $orders->lastPage()]);
        }

        return Inertia::render('admin/ops/shipments', ['orders' => $orders]);
    }

    public function updateShipment(Request $request, Order $order): RedirectResponse|JsonResponse
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

        if ($request->wantsJson()) {
            return response()->json(['ok' => true]);
        }

        return back()->with('status', 'Shipment updated.');
    }
}
