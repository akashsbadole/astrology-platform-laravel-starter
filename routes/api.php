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
| Shop / AstroMall (cart, orders, shipment) (authenticated)
|--------------------------------------------------------------------------
*/
Route::group(['middleware' => ['auth:sanctum']], function () {
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