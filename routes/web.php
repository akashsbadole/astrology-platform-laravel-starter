<?php

use App\Http\Controllers\Admin\AstrologerController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\OpsController as AdminOpsController;
use App\Http\Controllers\Admin\PoojaController as AdminPoojaController;
use App\Http\Controllers\Admin\PostController as AdminPostController;
use App\Http\Controllers\Admin\TaxonomyController;
use App\Http\Controllers\Astrologer\AvailabilityController;
use App\Http\Controllers\Astrologer\BookingController as AstrologerBookingController;
use App\Http\Controllers\Astrologer\DashboardController as AstrologerDashboardController;
use App\Http\Controllers\Astrologer\ProfileController as AstrologerProfileController;
use App\Http\Controllers\Astrologer\StatusController as AstrologerStatusController;
use App\Http\Controllers\Auth\OtpController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\Customer\AstrologerController as CustomerAstrologerController;
use App\Http\Controllers\Customer\BookingController as CustomerBookingController;
use App\Http\Controllers\Customer\DashboardController as CustomerDashboardController;
use App\Http\Controllers\Customer\KundliController;
use App\Http\Controllers\Customer\MilanController;
use App\Http\Controllers\Customer\PaymentController;
use App\Http\Controllers\Customer\PoojaBookingController;
use App\Http\Controllers\Customer\PoojaCatalogController;
use App\Http\Controllers\Customer\PoojaPaymentController;
use App\Http\Controllers\Customer\ReviewController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\HoroscopeController;
use App\Http\Controllers\LiveController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PanchangController;
use App\Http\Controllers\PoojaChatController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

// Public content
Route::get('blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('blog/{slug}', [BlogController::class, 'show'])->name('blog.show');

Route::get('astrologers', [CustomerAstrologerController::class, 'index'])->name('astrologers.public');
Route::get('horoscope', [HoroscopeController::class, 'index'])->name('horoscope.index');
Route::get('horoscope/{rashi}', [HoroscopeController::class, 'show'])->name('horoscope.show');
Route::get('shop', [ShopController::class, 'index'])->name('shop.index');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('shop/cart', [ShopController::class, 'cart'])->name('shop.cart');
    Route::post('shop/cart', [ShopController::class, 'addToCart'])->name('shop.cart.add');
    Route::post('shop/checkout', [ShopController::class, 'checkout'])->name('shop.checkout');
    Route::post('shop/orders/{order}/verify', [ShopController::class, 'verify'])->name('shop.verify');
    Route::get('shop/orders/{order}', [ShopController::class, 'showOrder'])->name('shop.order.show');
    Route::get('shop-orders', [ShopController::class, 'orders'])->name('shop.orders');
});

Route::get('shop/{slug}', [ShopController::class, 'show'])->name('shop.show');
Route::get('live', [LiveController::class, 'index'])->name('live.index');

Route::get('forum', [ForumController::class, 'index'])->name('forum.index');
Route::get('forum/category/{slug}', [ForumController::class, 'showCategory'])->name('forum.category.show');
Route::get('forum/threads/{thread}', [ForumController::class, 'showThread'])->name('forum.threads.show');

// OTP + social login (guests)
Route::middleware('guest')->group(function () {
    Route::get('login/otp', [OtpController::class, 'showRequest'])->name('otp.request.show');
    Route::post('login/otp', [OtpController::class, 'request'])->name('otp.request.store');
    Route::get('login/otp/verify', [OtpController::class, 'showVerify'])->name('otp.verify.show');
    Route::post('login/otp/verify', [OtpController::class, 'verify'])->name('otp.verify.store');

    Route::get('auth/{provider}/redirect', [SocialAuthController::class, 'redirect'])->name('social.redirect');
    Route::get('auth/{provider}/callback', [SocialAuthController::class, 'callback'])->name('social.callback');
});

Route::post('locale', [LocaleController::class, 'update'])->name('locale.update');
Route::post('webhooks/razorpay', [WalletController::class, 'webhook'])->name('webhooks.razorpay');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('wallet', [WalletController::class, 'index'])->name('wallet.index');
    Route::post('wallet/order', [WalletController::class, 'createOrder'])->name('wallet.order');
    Route::post('wallet/verify', [WalletController::class, 'verify'])->name('wallet.verify');

    Route::get('consultations', [ConsultationController::class, 'index'])->name('consult.index');
    Route::post('consultations', [ConsultationController::class, 'store'])->name('consult.store');
    Route::get('consult/{consultation}', [ConsultationController::class, 'show'])->name('consult.show');
    Route::post('consult/{consultation}/accept', [ConsultationController::class, 'accept'])->name('consult.accept');
    Route::post('consult/{consultation}/heartbeat', [ConsultationController::class, 'heartbeat'])->name('consult.heartbeat');
    Route::post('consult/{consultation}/end', [ConsultationController::class, 'end'])->name('consult.end');
    Route::post('consult/{consultation}/message', [ConsultationController::class, 'sendMessage'])->name('consult.message');
    Route::post('consult/{consultation}/signal', [ConsultationController::class, 'signal'])->name('consult.signal');
    Route::post('consult/{consultation}/recordings', [ConsultationController::class, 'storeRecording'])->name('consult.recording.store');
    Route::get('consult/{consultation}/recordings/{recording}', [ConsultationController::class, 'downloadRecording'])->name('consult.recording.download');

    Route::get('support', [SupportController::class, 'index'])->name('support.index');
    Route::post('support/tickets', [SupportController::class, 'storeTicket'])->name('support.ticket');
    Route::post('support/disputes', [SupportController::class, 'storeDispute'])->name('support.dispute');
    Route::post('support/refunds', [SupportController::class, 'requestRefund'])->name('support.refund');

    Route::get('live/{liveSession}', [LiveController::class, 'show'])->name('live.show');
    Route::post('live/{liveSession}/join', [LiveController::class, 'join'])->name('live.join');
    Route::post('live/{liveSession}/gift', [LiveController::class, 'gift'])->name('live.gift');
    Route::post('live/{liveSession}/message', [LiveController::class, 'message'])->name('live.message');

    Route::get('bookings/{booking}/chat', [ChatController::class, 'show'])->name('chat.show');
    Route::post('bookings/{booking}/chat', [ChatController::class, 'store'])->name('chat.store');

    // Pooja support chat (customer + admin). Chat opens on confirmed booking.
    Route::get('customer/pooja-bookings/{poojaBooking}/chat', [PoojaChatController::class, 'show'])->name('pooja-chat.show');
    Route::post('customer/pooja-bookings/{poojaBooking}/chat', [PoojaChatController::class, 'store'])->name('pooja-chat.store');
    Route::get('admin/pooja-bookings/{poojaBooking}/chat', [PoojaChatController::class, 'show'])->name('admin.pooja-chat.show');
    Route::post('admin/pooja-bookings/{poojaBooking}/chat', [PoojaChatController::class, 'store'])->name('admin.pooja-chat.store');

    Route::get('panchang', [PanchangController::class, 'show'])->name('panchang.show');

    // Notifications + referrals + forum participation (all roles)
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{id}/read', [NotificationController::class, 'read'])->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');
    Route::put('notifications/preferences', [NotificationController::class, 'updatePreferences'])->name('notifications.preferences');
    Route::post('notifications/device-token', [NotificationController::class, 'storeToken'])->name('notifications.token');

    Route::get('referrals', [ReferralController::class, 'index'])->name('referrals.index');
    Route::post('referrals/redeem', [ReferralController::class, 'redeem'])->name('referrals.redeem');

    Route::post('forum/threads', [ForumController::class, 'storeThread'])->name('forum.threads.store');
    Route::post('forum/threads/{thread}/replies', [ForumController::class, 'storeReply'])->name('forum.replies.store');
    Route::post('forum/threads/{thread}/moderate', [ForumController::class, 'moderate'])->name('forum.threads.moderate');

    Route::middleware('role:customer')->prefix('customer')->name('customer.')->group(function () {
        Route::get('dashboard', CustomerDashboardController::class)->name('dashboard');

        Route::get('astrologers', [CustomerAstrologerController::class, 'index'])->name('astrologers.index');
        Route::get('astrologers/{astrologer}', [CustomerAstrologerController::class, 'show'])->name('astrologers.show');

        Route::get('bookings', [CustomerBookingController::class, 'index'])->name('bookings.index');
        Route::post('bookings', [CustomerBookingController::class, 'store'])->name('bookings.store');
        Route::get('bookings/{booking}/checkout', [CustomerBookingController::class, 'checkout'])->name('bookings.checkout');
        Route::post('bookings/{booking}/review', [ReviewController::class, 'store'])->name('bookings.review');

        Route::post('bookings/{booking}/payment/order', [PaymentController::class, 'createOrder'])->name('bookings.payment.order');
        Route::post('bookings/{booking}/payment/verify', [PaymentController::class, 'verify'])->name('bookings.payment.verify');

        Route::get('kundli', [KundliController::class, 'index'])->name('kundli.index');
        Route::get('kundli/create', [KundliController::class, 'create'])->name('kundli.create');
        Route::post('kundli', [KundliController::class, 'store'])->name('kundli.store');
        Route::get('kundli/{kundli}', [KundliController::class, 'show'])->name('kundli.show');
        Route::delete('kundli/{kundli}', [KundliController::class, 'destroy'])->name('kundli.destroy');

        Route::get('milan', [MilanController::class, 'index'])->name('milan.index');
        Route::post('milan', [MilanController::class, 'match'])->name('milan.match');

        Route::get('poojas', [PoojaCatalogController::class, 'index'])->name('poojas.index');
        Route::get('poojas/{pooja}', [PoojaCatalogController::class, 'show'])->name('poojas.show');
        Route::post('poojas/{pooja}/bookings', [PoojaBookingController::class, 'store'])->name('poojas.bookings.store');

        Route::get('pooja-bookings', [PoojaBookingController::class, 'index'])->name('pooja-bookings.index');
        Route::get('pooja-bookings/{poojaBooking}/checkout', [PoojaBookingController::class, 'checkout'])->name('pooja-bookings.checkout');
        Route::post('pooja-bookings/{poojaBooking}/payment/order', [PoojaPaymentController::class, 'createOrder'])->name('pooja-bookings.payment.order');
        Route::post('pooja-bookings/{poojaBooking}/payment/verify', [PoojaPaymentController::class, 'verify'])->name('pooja-bookings.payment.verify');
    });

    Route::middleware('role:astrologer')->prefix('astrologer')->name('astrologer.')->group(function () {
        Route::get('dashboard', AstrologerDashboardController::class)->name('dashboard');
        Route::get('profile', [AstrologerProfileController::class, 'edit'])->name('profile.edit');
        Route::put('profile', [AstrologerProfileController::class, 'update'])->name('profile.update');
        Route::post('status', [AstrologerStatusController::class, 'update'])->name('status.update');

        Route::get('availability', [AvailabilityController::class, 'index'])->name('availability.index');
        Route::post('availability', [AvailabilityController::class, 'store'])->name('availability.store');
        Route::delete('availability/{availability}', [AvailabilityController::class, 'destroy'])->name('availability.destroy');

        Route::get('bookings', [AstrologerBookingController::class, 'index'])->name('bookings.index');
        Route::patch('bookings/{booking}/complete', [AstrologerBookingController::class, 'complete'])->name('bookings.complete');
        Route::patch('bookings/{booking}/cancel', [AstrologerBookingController::class, 'cancel'])->name('bookings.cancel');
    });

    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', AdminDashboardController::class)->name('dashboard');
        Route::get('astrologers', [AstrologerController::class, 'index'])->name('astrologers.index');
        Route::patch('astrologers/{astrologer}/approve', [AstrologerController::class, 'approve'])->name('astrologers.approve');
        Route::patch('astrologers/{astrologer}/reject', [AstrologerController::class, 'reject'])->name('astrologers.reject');

        Route::get('taxonomies', [TaxonomyController::class, 'index'])->name('taxonomies.index');
        Route::post('taxonomies', [TaxonomyController::class, 'store'])->name('taxonomies.store');
        Route::patch('taxonomies/{taxonomy}', [TaxonomyController::class, 'update'])->name('taxonomies.update');
        Route::delete('taxonomies/{taxonomy}', [TaxonomyController::class, 'destroy'])->name('taxonomies.destroy');

        Route::get('poojas', [AdminPoojaController::class, 'index'])->name('poojas.index');
        Route::get('poojas/create', [AdminPoojaController::class, 'create'])->name('poojas.create');
        Route::post('poojas', [AdminPoojaController::class, 'store'])->name('poojas.store');
        Route::get('poojas/{pooja}/edit', [AdminPoojaController::class, 'edit'])->name('poojas.edit');
        Route::put('poojas/{pooja}', [AdminPoojaController::class, 'update'])->name('poojas.update');
        Route::delete('poojas/{pooja}', [AdminPoojaController::class, 'destroy'])->name('poojas.destroy');

        Route::get('posts', [AdminPostController::class, 'index'])->name('posts.index');
        Route::get('posts/create', [AdminPostController::class, 'create'])->name('posts.create');
        Route::post('posts', [AdminPostController::class, 'store'])->name('posts.store');
        Route::get('posts/{post}/edit', [AdminPostController::class, 'edit'])->name('posts.edit');
        Route::put('posts/{post}', [AdminPostController::class, 'update'])->name('posts.update');
        Route::delete('posts/{post}', [AdminPostController::class, 'destroy'])->name('posts.destroy');

        Route::get('ops', [AdminOpsController::class, 'dashboard'])->name('ops.dashboard');
        Route::get('ops/coupons', [AdminOpsController::class, 'coupons'])->name('ops.coupons');
        Route::post('ops/coupons', [AdminOpsController::class, 'storeCoupon'])->name('ops.coupons.store');
        Route::get('ops/payouts', [AdminOpsController::class, 'payouts'])->name('ops.payouts');
        Route::post('ops/payouts/{payout}/approve', [AdminOpsController::class, 'approvePayout'])->name('ops.payouts.approve');
        Route::get('ops/refunds', [AdminOpsController::class, 'refunds'])->name('ops.refunds');
        Route::post('ops/refunds/{refund}/process', [AdminOpsController::class, 'processRefund'])->name('ops.refunds.process');
        Route::get('ops/disputes', [AdminOpsController::class, 'disputes'])->name('ops.disputes');
        Route::post('ops/disputes/{dispute}/resolve', [AdminOpsController::class, 'resolveDispute'])->name('ops.disputes.resolve');
        Route::get('ops/horoscopes', [AdminOpsController::class, 'horoscopes'])->name('ops.horoscopes');
        Route::post('ops/horoscopes', [AdminOpsController::class, 'storeHoroscope'])->name('ops.horoscopes.store');
        Route::get('ops/products', [AdminOpsController::class, 'products'])->name('ops.products');
        Route::post('ops/products', [AdminOpsController::class, 'storeProduct'])->name('ops.products.store');
        Route::get('ops/live', [AdminOpsController::class, 'live'])->name('ops.live');
        Route::post('ops/live', [AdminOpsController::class, 'storeLive'])->name('ops.live.store');
        Route::post('ops/live/{liveSession}/toggle', [AdminOpsController::class, 'goLive'])->name('ops.live.toggle');
        Route::get('ops/banners', [AdminOpsController::class, 'banners'])->name('ops.banners');
        Route::post('ops/banners', [AdminOpsController::class, 'storeBanner'])->name('ops.banners.store');
        Route::get('ops/support', [AdminOpsController::class, 'support'])->name('ops.support');
        Route::get('ops/shipments', [AdminOpsController::class, 'shipments'])->name('ops.shipments');
        Route::post('ops/shipments/{order}', [AdminOpsController::class, 'updateShipment'])->name('ops.shipments.update');
    });
});

require __DIR__.'/settings.php';
