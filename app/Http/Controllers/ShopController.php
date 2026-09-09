<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use App\Services\RazorpayService;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;

class ShopController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('shop/index', [
            'products' => Product::where('is_active', true)->latest()->paginate(12)->through(fn (Product $p) => [
                'id' => $p->id, 'slug' => $p->slug, 'name' => $p->name, 'price' => $p->price_paise / 100, 'mrp' => $p->mrp_paise ? $p->mrp_paise / 100 : null, 'stock' => $p->stock, 'images' => $p->images,
            ]),
        ]);
    }

    public function show(string $slug): Response
    {
        $p = Product::where('slug', $slug)->where('is_active', true)->firstOrFail();

        return Inertia::render('shop/show', ['product' => [
            'id' => $p->id, 'slug' => $p->slug, 'name' => $p->name, 'description' => $p->description,
            'price' => $p->price_paise / 100, 'mrp' => $p->mrp_paise ? $p->mrp_paise / 100 : null, 'stock' => $p->stock,
        ]]);
    }

    public function cart(Request $request): Response
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        $items = $cart->items()->with('product')->get()->map(fn ($i) => [
            'id' => $i->id, 'qty' => $i->qty, 'name' => $i->product->name, 'price' => $i->product->price_paise / 100, 'product_id' => $i->product_id,
        ]);

        return Inertia::render('shop/cart', ['items' => $items, 'total' => $items->sum(fn ($i) => $i['price'] * $i['qty'])]);
    }

    public function addToCart(Request $request): RedirectResponse
    {
        $v = $request->validate(['product_id' => 'required|exists:products,id', 'qty' => 'nullable|integer|min:1|max:10']);
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        $item = $cart->items()->firstOrNew(['product_id' => $v['product_id']]);
        $item->qty = ($item->exists ? $item->qty : 0) + ($v['qty'] ?? 1);
        $item->save();

        return back()->with('status', 'Added to cart.');
    }

    public function checkout(Request $request, WalletService $wallets): RedirectResponse|JsonResponse
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        $items = $cart->items()->with('product')->get();
        abort_if($items->isEmpty(), 422, 'Cart empty.');
        $subtotal = $items->sum(fn ($i) => $i->product->price_paise * $i->qty);
        $order = Order::create(['user_id' => $request->user()->id, 'status' => 'pending', 'subtotal_paise' => $subtotal, 'total_paise' => $subtotal]);
        foreach ($items as $i) {
            $order->items()->create(['product_id' => $i->product_id, 'qty' => $i->qty, 'price_paise' => $i->product->price_paise]);
        }
        // Try wallet first
        try {
            $wallets->debit($request->user(), $subtotal, WalletService::newKey('order-'.$order->id), $order, 'debit', []);
            $order->update(['status' => 'paid']);
            $cart->items()->delete();

            return redirect()->route('shop.orders')->with('status', 'Order paid with wallet.');
        } catch (\Throwable) {
            $razor = app(RazorpayService::class)->createOrder($subtotal / 100, 'order-'.$order->id);
            $order->update(['razorpay_order_id' => $razor['id']]);
            if ($request->wantsJson()) {
                return response()->json(['order_id' => $razor['id'], 'amount' => $razor['amount'], 'key_id' => config('services.razorpay.key_id'), 'local_order_id' => $order->id]);
            }

            return Inertia::render('shop/checkout', ['order' => ['id' => $order->id, 'total' => $subtotal / 100], 'razorpayKeyId' => config('services.razorpay.key_id'), 'razorpayOrder' => $razor]);
        }
    }

    public function orders(Request $request): Response
    {
        return Inertia::render('shop/orders', [
            'orders' => Order::where('user_id', $request->user()->id)->latest()->paginate(15),
        ]);
    }

    public function verify(Request $request, Order $order): RedirectResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403);
        abort_unless($order->status === 'pending', 422, 'Order already processed.');

        $v = $request->validate([
            'razorpay_order_id' => ['required', 'string'],
            'razorpay_payment_id' => ['required', 'string'],
            'razorpay_signature' => ['required', 'string'],
        ]);
        abort_unless($v['razorpay_order_id'] === $order->razorpay_order_id, 422, 'Order mismatch.');

        $ok = app(RazorpayService::class)->verifySignature($v['razorpay_order_id'], $v['razorpay_payment_id'], $v['razorpay_signature']);
        abort_unless($ok, 422, 'Payment verification failed.');

        $order->update(['status' => 'paid', 'razorpay_payment_id' => $v['razorpay_payment_id']]);
        foreach ($order->items as $item) {
            $item->product?->decrement('stock', $item->qty);
        }
        Cart::where('user_id', $request->user()->id)->first()?->items()->delete();

        return redirect()->route('shop.orders')->with('status', 'Order paid. Thank you!');
    }
}
