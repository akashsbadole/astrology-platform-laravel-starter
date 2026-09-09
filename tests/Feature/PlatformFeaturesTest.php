<?php

namespace Tests\Feature;

use App\Enums\BookingStatus;
use App\Enums\ConsultationType;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\ForumCategory;
use App\Models\ForumThread;
use App\Models\Pooja;
use App\Models\PoojaBooking;
use App\Models\Post;
use App\Models\User;
use App\Notifications\ReferralEarned;
use App\Services\OtpService;
use App\Services\ReferralService;
use App\Services\SmsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlatformFeaturesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    private function makeUser(UserRole $role, array $overrides = []): User
    {
        return User::factory()->create([
            'role' => $role->value,
            'email_verified_at' => now(),
            ...$overrides,
        ]);
    }

    public function test_otp_request_and_verify_logs_user_in(): void
    {
        $service = app(OtpService::class);
        $identifier = '+919876543210';

        $code = $service->request($identifier);

        $this->assertTrue($service->verify($identifier, $code));
        // Consumed codes cannot be reused.
        $this->assertFalse($service->verify($identifier, $code));
    }

    public function test_otp_login_creates_account_via_http(): void
    {
        $identifier = '+911234567890';

        $this->post('/login/otp', ['identifier' => $identifier])
            ->assertRedirect(route('otp.verify.show', ['identifier' => strtolower($identifier)]));

        $code = app(OtpService::class)->request($identifier);

        // Request overwrote previous code; fetch latest by verifying directly is not possible
        // via HTTP without knowing code, so verify using the known code through the endpoint.
        $this->post('/login/otp/verify', ['identifier' => $identifier, 'code' => $code])
            ->assertRedirect('/dashboard');

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', ['phone' => $identifier]);
    }

    public function test_booking_chat_requires_session_but_history_viewable(): void
    {
        $customer = $this->makeUser(UserRole::Customer);
        $astrologer = $this->makeUser(UserRole::Astrologer);

        $booking = Booking::create([
            'customer_id' => $customer->id,
            'astrologer_id' => $astrologer->id,
            'consultation_type' => ConsultationType::Chat->value,
            'scheduled_at' => now()->addHour(),
            'duration_minutes' => 30,
            'rate_per_min' => 10,
            'amount' => 300,
            'status' => BookingStatus::Confirmed->value,
            'payment_status' => PaymentStatus::Paid->value,
        ]);

        // History viewable before session opens.
        $this->actingAs($customer)->get("/bookings/{$booking->id}/chat")->assertOk();

        // Sending blocked outside window.
        $this->actingAs($customer)->postJson("/bookings/{$booking->id}/chat", ['body' => 'hi'])
            ->assertStatus(422);

        // Move into session window.
        $booking->update(['scheduled_at' => now()->subMinutes(5)]);

        $this->actingAs($customer)->postJson("/bookings/{$booking->id}/chat", ['body' => 'hello there'])
            ->assertOk()
            ->assertJsonFragment(['body' => 'hello there']);

        $this->assertDatabaseHas('messages', ['booking_id' => $booking->id, 'body' => 'hello there']);
        $this->assertDatabaseHas('notifications', ['notifiable_id' => $astrologer->id]);
    }

    public function test_pooja_support_chat_works_after_confirmation(): void
    {
        $customer = $this->makeUser(UserRole::Customer);
        $admin = $this->makeUser(UserRole::Admin);

        $pooja = Pooja::create([
            'name' => 'Test Pooja', 'category' => 'General', 'duration_minutes' => 60,
            'price' => 1100, 'is_online' => true, 'is_active' => true,
        ]);

        $booking = PoojaBooking::create([
            'customer_id' => $customer->id,
            'pooja_id' => $pooja->id,
            'scheduled_date' => now()->addDays(2)->toDateString(),
            'amount' => 1100,
            'status' => 'pending_payment',
            'payment_status' => 'unpaid',
        ]);

        // Blocked before confirmation.
        $this->actingAs($customer)->get("/customer/pooja-bookings/{$booking->id}/chat")->assertOk();
        $this->actingAs($customer)->postJson("/customer/pooja-bookings/{$booking->id}/chat", ['body' => 'hi'])
            ->assertStatus(422);

        $booking->update(['status' => 'confirmed', 'payment_status' => 'paid']);

        $this->actingAs($customer)->postJson("/customer/pooja-bookings/{$booking->id}/chat", ['body' => 'Jai shree'])
            ->assertOk();

        $this->assertDatabaseHas('pooja_messages', ['pooja_booking_id' => $booking->id]);

        // Admin can view + reply.
        $this->actingAs($admin)->get("/admin/pooja-bookings/{$booking->id}/chat")->assertOk();
        $this->actingAs($admin)->postJson("/admin/pooja-bookings/{$booking->id}/chat", ['body' => 'Namaste, confirmed'])
            ->assertOk();
    }

    public function test_blog_public_and_admin_crud(): void
    {
        $admin = $this->makeUser(UserRole::Admin);
        $author = $this->makeUser(UserRole::Admin);

        $post = Post::create([
            'user_id' => $author->id,
            'slug' => 'test-article',
            'title' => 'Test Article',
            'excerpt' => 'excerpt',
            'body' => 'Body content here, long enough.',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $this->get('/blog')->assertOk();
        $this->get('/blog/test-article')->assertOk();

        $this->actingAs($admin)->post('/admin/posts', [
            'title' => 'Second Post',
            'excerpt' => 'ex',
            'body' => 'This is a sufficiently long body.',
            'status' => 'published',
        ])->assertRedirect();

        $this->assertDatabaseHas('posts', ['slug' => 'second-post']);
    }

    public function test_forum_thread_and_reply(): void
    {
        $user = $this->makeUser(UserRole::Customer);
        $category = ForumCategory::create(['name' => 'General', 'slug' => 'general']);

        $this->actingAs($user)->post('/forum/threads', [
            'category_id' => $category->id,
            'title' => 'My first question',
            'body' => 'What is the best time for pooja tomorrow? Details here.',
        ])->assertRedirect();

        $thread = ForumThread::first();
        $this->assertNotNull($thread);

        $this->get("/forum/threads/{$thread->id}")->assertOk();

        $this->actingAs($user)->post("/forum/threads/{$thread->id}/replies", [
            'body' => 'Adding more context to my question.',
        ])->assertRedirect();

        $this->assertDatabaseHas('forum_posts', ['thread_id' => $thread->id]);
    }

    public function test_referral_and_loyalty_flow(): void
    {
        $referrer = $this->makeUser(UserRole::Customer);
        $service = app(ReferralService::class);
        $code = $service->codeFor($referrer);

        $referred = $this->makeUser(UserRole::Customer);
        $service->attach($referred, $code);

        $this->assertDatabaseHas('referrals', [
            'referrer_id' => $referrer->id,
            'referred_id' => $referred->id,
        ]);

        $booking = new Booking(['id' => 999]);
        $booking->id = 999;

        // Use a real persisted booking for FK-less morph reference.
        $customer = $referred;
        $astrologer = $this->makeUser(UserRole::Astrologer);
        $real = Booking::create([
            'customer_id' => $customer->id,
            'astrologer_id' => $astrologer->id,
            'consultation_type' => ConsultationType::Chat->value,
            'scheduled_at' => now()->addDay(),
            'duration_minutes' => 30,
            'rate_per_min' => 20,
            'amount' => 600,
            'status' => BookingStatus::Confirmed->value,
            'payment_status' => PaymentStatus::Paid->value,
        ]);

        $service->awardForPaidBooking($customer, '600', $real, 'booking');

        $referrer->refresh();
        $customer->refresh();

        // 5% of 600 = 30 earn + 200 referral = 230 for referred; 200 for referrer.
        $this->assertEquals(230, $customer->loyalty_points);
        $this->assertEquals(200, $referrer->loyalty_points);

        $this->actingAs($customer)->get('/referrals')->assertOk();

        $discount = $service->redeem($customer, 100);
        $this->assertEquals(100, $discount);
        $this->assertEquals(130, $customer->fresh()->loyalty_points);
    }

    public function test_notifications_center_and_locale_switch(): void
    {
        $user = $this->makeUser(UserRole::Customer);

        $user->notify(new ReferralEarned(200, 'TESTCODE'));

        $this->actingAs($user)->get('/notifications')->assertOk();
        $this->assertEquals(1, $user->fresh()->unreadNotifications()->count());

        $this->actingAs($user)->post('/notifications/read-all')->assertRedirect();
        $this->assertEquals(0, $user->fresh()->unreadNotifications()->count());

        $this->post('/locale', ['locale' => 'hi'])->assertRedirect();
        $this->assertEquals('hi', session('locale'));

        $this->actingAs($user)->post('/locale', ['locale' => 'ta'])->assertRedirect();
        $this->assertEquals('ta', $user->fresh()->locale);
    }

    public function test_sms_service_logs_by_default(): void
    {
        $this->assertTrue(app(SmsService::class)->send('+911234567890', 'hello test'));
    }
}
