<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (React‑Native)
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api and return JSON.
| Authentication is handled by Laravel Sanctum (token‑based).
|
*/

/*
|--------------------------------------------------------------------------
| Authentication (OTP + Social) – guest only
|--------------------------------------------------------------------------
*/
Route::group(['middleware' => ['guest']], function () {
    Route::post('auth/otp/request', [\App\Http\Controllers\Auth\OtpController::class, 'request'])->name('api.otp.request');
    Route::post('auth/otp/verify', [\App\Http\Controllers\Auth\OtpController::class, 'verify'])->name('api.otp.verify');

    Route::post('auth/social/{provider}', [\App\Http\Controllers\Auth\SocialAuthController::class, 'redirect'])->name('api.social.redirect');
    Route::get('auth/social/{provider}/callback', [\App\Http\Controllers\Auth\SocialAuthController::class, 'callback'])->name('api.social.callback');
});

/*
|--------------------------------------------------------------------------
| Wallet / Payments (authenticated)
|--------------------------------------------------------------------------
*/
Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::get('wallet', [\App\Http\Controllers\WalletController::class, 'index'])->name('api.wallet');
    Route::post('wallet/order', [\App\Http\Controllers\WalletController::class, 'createOrder'])->name('api.wallet.order');
    Route::post('wallet/verify', [\App\Http\Controllers\WalletController::class, 'verify'])->name('api.wallet.verify');

    // Public webhook – Razorpay will POST here; signature verified inside handler.
    Route::post('webhooks/razorpay', [\App\Http\Controllers\WalletController::class, 'webhook'])->name('api.webhook.razorpay');
});

/*
|--------------------------------------------------------------------------
| Instant Consultations (chat / call / video) (authenticated)
|--------------------------------------------------------------------------
*/
Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::get('consultations', [\App\Http\Controllers\ConsultationController::class, 'index'])->name('api.consult.index');
    Route::post('consultations', [\App\Http\Controllers\ConsultationController::class, 'store'])->name('api.consult.store');
    Route::get('consult/{consultation}', [\App\Http\Controllers\ConsultationController::class, 'show'])->name('api.consult.show');
    Route::post('consult/{consultation}/accept', [\App\Http\Controllers\ConsultationController::class, 'accept'])->name('api.consult.accept');
    Route::post('consult/{consultation}/heartbeat', [\App\Http\Controllers\ConsultationController::class, 'heartbeat'])->name('api.consult.heartbeat');
    Route::post('consult/{consultation}/end', [\App\Http\Controllers\ConsultationController::class, 'end'])->name('api.consult.end');
    Route::post('consult/{consultation}/message', [\App\Http\Controllers\ConsultationController::class, 'sendMessage'])->name('api.consult.message');
    Route::post('consult/{consultation}/signal', [\App\Http\Controllers\ConsultationController::class, 'signal'])->name('api.consult.signal');
    Route::post('consult/{consultation}/recordings', [\App\Http\Controllers\ConsultationController::class, 'storeRecording'])->name('api.consult.recording.store');
    Route::get('consult/{consultation}/recordings/{recording}', [\App\Http\Controllers\ConsultationController::class, 'downloadRecording'])->name('api.consult.recording.download');
});

/*
|--------------------------------------------------------------------------
| Horoscope & Panchang (public – no auth needed)
|--------------------------------------------------------------------------
*/
Route::get('horoscope', [\App\Http\Controllers\HoroscopeController::class, 'index'])->name('api.horoscope.index');
Route::get('horoscope/{rashi}', [\App\Http\Controllers\HoroscopeController::class, 'show'])->name('api.horoscope.show');

/*
|--------------------------------------------------------------------------
| Astrologers (public – browse & profiles for the mobile app)
|--------------------------------------------------------------------------
*/
Route::get('astrologers', [\App\Http\Controllers\Customer\AstrologerController::class, 'index'])->name('api.astrologers.index');
Route::get('astrologers/{astrologer}', [\App\Http\Controllers\Customer\AstrologerController::class, 'show'])->name('api.astrologers.show');

/*
|--------------------------------------------------------------------------
| Kundli & Milan (public, some actions need auth)
|--------------------------------------------------------------------------
*/
Route::get('kundli', [\App\Http\Controllers\Customer\KundliController::class, 'index'])->name('api.kundli.index');
Route::post('kundli', [\App\Http\Controllers\Customer\KundliController::class, 'store'])->name('api.kundli.store');
Route::get('kundli/{kundli}', [\App\Http\Controllers\Customer\KundliController::class, 'show'])->name('api.kundli.show');

Route::get('milan', [\App\Http\Controllers\Customer\MilanController::class, 'index'])->name('api.milan.index');
Route::post('milan', [\App\Http\Controllers\Customer\MilanController::class, 'match'])->name('api.milan.match');

/*
|--------------------------------------------------------------------------
| Live sessions (join, gift, Q&A) (authenticated)
|--------------------------------------------------------------------------
*/
Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::get('live/{liveSession}', [\App\Http\Controllers\LiveController::class, 'show'])->name('api.live.show');
    Route::post('live/{liveSession}/join', [\App\Http\Controllers\LiveController::class, 'join'])->name('api.live.join');
    Route::post('live/{liveSession}/gift', [\App\Http\Controllers\LiveController::class, 'gift'])->name('api.live.gift');
    Route::post('live/{liveSession}/message', [\App\Http\Controllers\LiveController::class, 'message'])->name('api.live.message');
});

/*
|--------------------------------------------------------------------------
| Astrologer app (authenticated, role:astrologer)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'role:astrologer'])->prefix('astrologer')->name('api.astrologer.')->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\Astrologer\DashboardController::class, '__invoke'])->name('dashboard');
    Route::post('status', [\App\Http\Controllers\Astrologer\StatusController::class, 'update'])->name('status');

    Route::get('profile', [\App\Http\Controllers\Astrologer\ProfileController::class, 'edit'])->name('profile');
    Route::put('profile', [\App\Http\Controllers\Astrologer\ProfileController::class, 'update'])->name('profile.update');

    Route::get('availability', [\App\Http\Controllers\Astrologer\AvailabilityController::class, 'index'])->name('availability');
    Route::post('availability', [\App\Http\Controllers\Astrologer\AvailabilityController::class, 'store'])->name('availability.store');
    Route::delete('availability/{availability}', [\App\Http\Controllers\Astrologer\AvailabilityController::class, 'destroy'])->name('availability.destroy');

    Route::get('bookings', [\App\Http\Controllers\Astrologer\BookingController::class, 'index'])->name('bookings');
    Route::patch('bookings/{booking}/complete', [\App\Http\Controllers\Astrologer\BookingController::class, 'complete'])->name('bookings.complete');
    Route::patch('bookings/{booking}/cancel', [\App\Http\Controllers\Astrologer\BookingController::class, 'cancel'])->name('bookings.cancel');
});

/*
|--------------------------------------------------------------------------
| Admin app (authenticated, role:admin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->name('api.admin.')->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\Admin\DashboardController::class, '__invoke'])->name('dashboard');
    Route::get('astrologers', [\App\Http\Controllers\Admin\AstrologerController::class, 'index'])->name('astrologers');
    Route::patch('astrologers/{astrologer}/approve', [\App\Http\Controllers\Admin\AstrologerController::class, 'approve'])->name('astrologers.approve');
    Route::patch('astrologers/{astrologer}/reject', [\App\Http\Controllers\Admin\AstrologerController::class, 'reject'])->name('astrologers.reject');

    Route::get('taxonomies', [\App\Http\Controllers\Admin\TaxonomyController::class, 'index'])->name('taxonomies');
    Route::post('taxonomies', [\App\Http\Controllers\Admin\TaxonomyController::class, 'store'])->name('taxonomies.store');
    Route::patch('taxonomies/{taxonomy}', [\App\Http\Controllers\Admin\TaxonomyController::class, 'update'])->name('taxonomies.update');
    Route::delete('taxonomies/{taxonomy}', [\App\Http\Controllers\Admin\TaxonomyController::class, 'destroy'])->name('taxonomies.destroy');

    Route::get('poojas', [\App\Http\Controllers\Admin\PoojaController::class, 'index'])->name('poojas');
    Route::post('poojas', [\App\Http\Controllers\Admin\PoojaController::class, 'store'])->name('poojas.store');
    Route::get('poojas/{pooja}', [\App\Http\Controllers\Admin\PoojaController::class, 'show'])->name('poojas.show');
    Route::put('poojas/{pooja}', [\App\Http\Controllers\Admin\PoojaController::class, 'update'])->name('poojas.update');
    Route::delete('poojas/{pooja}', [\App\Http\Controllers\Admin\PoojaController::class, 'destroy'])->name('poojas.destroy');

    Route::get('posts', [\App\Http\Controllers\Admin\PostController::class, 'index'])->name('posts');
    Route::post('posts', [\App\Http\Controllers\Admin\PostController::class, 'store'])->name('posts.store');
    Route::get('posts/{post}', [\App\Http\Controllers\Admin\PostController::class, 'show'])->name('posts.show');
    Route::put('posts/{post}', [\App\Http\Controllers\Admin\PostController::class, 'update'])->name('posts.update');
    Route::delete('posts/{post}', [\App\Http\Controllers\Admin\PostController::class, 'destroy'])->name('posts.destroy');

    Route::get('ops', [\App\Http\Controllers\Admin\OpsController::class, 'dashboard'])->name('ops.dashboard');
    Route::get('ops/coupons', [\App\Http\Controllers\Admin\OpsController::class, 'coupons'])->name('ops.coupons');
    Route::post('ops/coupons', [\App\Http\Controllers\Admin\OpsController::class, 'storeCoupon'])->name('ops.coupons.store');
    Route::get('ops/payouts', [\App\Http\Controllers\Admin\OpsController::class, 'payouts'])->name('ops.payouts');
    Route::post('ops/payouts/{payout}/approve', [\App\Http\Controllers\Admin\OpsController::class, 'approvePayout'])->name('ops.payouts.approve');
    Route::get('ops/refunds', [\App\Http\Controllers\Admin\OpsController::class, 'refunds'])->name('ops.refunds');
    Route::post('ops/refunds/{refund}/process', [\App\Http\Controllers\Admin\OpsController::class, 'processRefund'])->name('ops.refunds.process');
    Route::get('ops/disputes', [\App\Http\Controllers\Admin\OpsController::class, 'disputes'])->name('ops.disputes');
    Route::post('ops/disputes/{dispute}/resolve', [\App\Http\Controllers\Admin\OpsController::class, 'resolveDispute'])->name('ops.disputes.resolve');
    Route::get('ops/horoscopes', [\App\Http\Controllers\Admin\OpsController::class, 'horoscopes'])->name('ops.horoscopes');
    Route::post('ops/horoscopes', [\App\Http\Controllers\Admin\OpsController::class, 'storeHoroscope'])->name('ops.horoscopes.store');
    Route::get('ops/products', [\App\Http\Controllers\Admin\OpsController::class, 'products'])->name('ops.products');
    Route::post('ops/products', [\App\Http\Controllers\Admin\OpsController::class, 'storeProduct'])->name('ops.products.store');
    Route::get('ops/live', [\App\Http\Controllers\Admin\OpsController::class, 'live'])->name('ops.live');
    Route::post('ops/live', [\App\Http\Controllers\Admin\OpsController::class, 'storeLive'])->name('ops.live.store');
    Route::post('ops/live/{liveSession}/toggle', [\App\Http\Controllers\Admin\OpsController::class, 'goLive'])->name('ops.live.toggle');
    Route::get('ops/banners', [\App\Http\Controllers\Admin\OpsController::class, 'banners'])->name('ops.banners');
    Route::post('ops/banners', [\App\Http\Controllers\Admin\OpsController::class, 'storeBanner'])->name('ops.banners.store');
    Route::get('ops/support', [\App\Http\Controllers\Admin\OpsController::class, 'support'])->name('ops.support');
    Route::get('ops/shipments', [\App\Http\Controllers\Admin\OpsController::class, 'shipments'])->name('ops.shipments');
    Route::post('ops/shipments/{order}', [\App\Http\Controllers\Admin\OpsController::class, 'updateShipment'])->name('ops.shipments.update');
});

/*
|--------------------------------------------------------------------------
| Shop / AstroMall (cart, orders, shipment) (authenticated)
|--------------------------------------------------------------------------
*/
Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::get('shop', [\App\Http\Controllers\ShopController::class, 'index'])->name('api.shop.index');
    Route::get('shop/{slug}', [\App\Http\Controllers\ShopController::class, 'show'])->name('api.shop.show');
    Route::get('shop/cart', [\App\Http\Controllers\ShopController::class, 'cart'])->name('api.shop.cart');
    Route::post('shop/cart', [\App\Http\Controllers\ShopController::class, 'addToCart'])->name('api.shop.cart.add');
    Route::post('shop/checkout', [\App\Http\Controllers\ShopController::class, 'checkout'])->name('api.shop.checkout');
    Route::post('shop/orders/{order}/verify', [\App\Http\Controllers\ShopController::class, 'verify'])->name('api.shop.verify');
    Route::get('shop/orders/{order}', [\App\Http\Controllers\ShopController::class, 'showOrder'])->name('api.shop.order.show');
    Route::get('shop-orders', [\App\Http\Controllers\ShopController::class, 'orders'])->name('api.shop.orders');
    Route::post('shop/orders/{order}/shipment', [\App\Http\Controllers\ShopController::class, 'updateShipment'])->name('api.shop.shipment.update');
});

/*
|--------------------------------------------------------------------------
| Customer Bookings (authenticated)
|--------------------------------------------------------------------------
*/
Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::get('bookings', [\App\Http\Controllers\Customer\BookingController::class, 'index'])->name('api.bookings.index');
    Route::post('bookings', [\App\Http\Controllers\Customer\BookingController::class, 'store'])->name('api.bookings.store');
    Route::get('bookings/{booking}/checkout', [\App\Http\Controllers\Customer\BookingController::class, 'checkout'])->name('api.bookings.checkout');
    Route::post('bookings/{booking}/payment/order', [\App\Http\Controllers\Customer\PaymentController::class, 'createOrder'])->name('api.bookings.payment.order');
    Route::post('bookings/{booking}/payment/verify', [\App\Http\Controllers\Customer\PaymentController::class, 'verify'])->name('api.bookings.payment.verify');

    Route::get('bookings/{booking}/chat', [\App\Http\Controllers\ChatController::class, 'show'])->name('api.chat.show');
    Route::post('bookings/{booking}/chat', [\App\Http\Controllers\ChatController::class, 'store'])->name('api.chat.store');

    Route::post('poojas/{pooja}/bookings', [\App\Http\Controllers\Customer\PoojaBookingController::class, 'store'])->name('api.poojas.bookings.store');
    Route::get('pooja-bookings', [\App\Http\Controllers\Customer\PoojaBookingController::class, 'index'])->name('api.pooja-bookings.index');
    Route::get('pooja-bookings/{poojaBooking}/checkout', [\App\Http\Controllers\Customer\PoojaBookingController::class, 'checkout'])->name('api.pooja-bookings.checkout');
    Route::post('pooja-bookings/{poojaBooking}/payment/order', [\App\Http\Controllers\Customer\PoojaPaymentController::class, 'createOrder'])->name('api.pooja-bookings.payment.order');
    Route::post('pooja-bookings/{poojaBooking}/payment/verify', [\App\Http\Controllers\Customer\PoojaPaymentController::class, 'verify'])->name('api.pooja-bookings.payment.verify');

    Route::get('pooja-bookings/{poojaBooking}/chat', [\App\Http\Controllers\PoojaChatController::class, 'show'])->name('api.pooja-chat.show');
    Route::post('pooja-bookings/{poojaBooking}/chat', [\App\Http\Controllers\PoojaChatController::class, 'store'])->name('api.pooja-chat.store');
});

/*
|--------------------------------------------------------------------------
| Referral / Loyalty (authenticated)
|--------------------------------------------------------------------------
*/
Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::get('referrals', [\App\Http\Controllers\ReferralController::class, 'index'])->name('api.referrals.index');
    Route::post('referrals/redeem', [\App\Http\Controllers\ReferralController::class, 'redeem'])->name('api.referrals.redeem');
});

/*
|--------------------------------------------------------------------------
| Notifications / Device tokens (authenticated)
|--------------------------------------------------------------------------
*/
Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::get('notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('api.notifications.index');
    Route::post('notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'read'])->name('api.notifications.read');
    Route::post('notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'readAll'])->name('api.notifications.read-all');
    Route::put('notifications/preferences', [\App\Http\Controllers\NotificationController::class, 'updatePreferences'])->name('api.notifications.preferences');
    Route::post('notifications/device-token', [\App\Http\Controllers\NotificationController::class, 'storeToken'])->name('api.notifications.token');
});

/*
|--------------------------------------------------------------------------
| Support / Tickets / Disputes / Refunds (authenticated)
|--------------------------------------------------------------------------
*/
Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::get('support', [\App\Http\Controllers\SupportController::class, 'index'])->name('api.support.index');
    Route::post('support/tickets', [\App\Http\Controllers\SupportController::class, 'storeTicket'])->name('api.support.ticket');
    Route::post('support/disputes', [\App\Http\Controllers\SupportController::class, 'storeDispute'])->name('api.support.dispute');
    Route::post('support/refunds', [\App\Http\Controllers\SupportController::class, 'requestRefund'])->name('api.support.refund');
});

/*
|--------------------------------------------------------------------------
| Forum (public read, authenticated write)
|--------------------------------------------------------------------------
*/
Route::get('forum', [\App\Http\Controllers\ForumController::class, 'index'])->name('api.forum.index');
Route::get('forum/category/{slug}', [\App\Http\Controllers\ForumController::class, 'showCategory'])->name('api.forum.category.show');
Route::get('forum/threads/{thread}', [\App\Http\Controllers\ForumController::class, 'showThread'])->name('api.forum.threads.show');
Route::post('forum/threads', [\App\Http\Controllers\ForumController::class, 'storeThread'])->name('api.forum.threads.store');
Route::post('forum/threads/{thread}/replies', [\App\Http\Controllers\ForumController::class, 'storeReply'])->name('api.forum.replies.store');
Route::post('forum/threads/{thread}/moderate', [\App\Http\Controllers\ForumController::class, 'moderate'])->name('api.forum.threads.moderate');

/*
|--------------------------------------------------------------------------
| Miscellaneous
|--------------------------------------------------------------------------
*/
Route::get('locale', [\App\Http\Controllers\LocaleController::class, 'update'])->name('api.locale.update');