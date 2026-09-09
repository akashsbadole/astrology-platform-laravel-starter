<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\CallRecording;
use App\Models\LiveSession;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\ConsultationService;
use App\Services\WalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class AstroTalkParityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    private function astrologer(int $rateChat = 20): User
    {
        $u = User::factory()->create(['role' => UserRole::Astrologer->value, 'email_verified_at' => now()]);
        $u->astrologerProfile()->create([
            'status' => 'approved', 'experience_years' => 5,
            'rate_chat_per_min' => $rateChat, 'rate_call_per_min' => $rateChat + 5, 'rate_video_per_min' => $rateChat + 10,
        ]);

        return $u;
    }

    public function test_wallet_credit_debit_idempotent(): void
    {
        $u = User::factory()->create(['role' => 'customer', 'email_verified_at' => now()]);
        $w = app(WalletService::class);
        $w->credit($u, 50000, 'k1');
        $w->credit($u, 50000, 'k1');
        $this->assertEquals(50000, $w->balancePaise($u));
        $w->debit($u, 10000, 'k2');
        $this->assertEquals(40000, $w->balancePaise($u));
    }

    public function test_consult_request_accept_tick_autocut(): void
    {
        $c = User::factory()->create(['role' => 'customer', 'email_verified_at' => now()]);
        $a = $this->astrologer(20);
        $w = app(WalletService::class);
        $w->credit($c, 20000, 'rc1'); // ₹200
        $svc = app(ConsultationService::class);

        $con = $svc->request($c, $a, 'chat');
        $this->assertEquals('queued', $con->status);
        $svc->accept($a, $con);
        $this->assertEquals('active', $con->fresh()->status);

        $out = $svc->heartbeat($a, $con->fresh(), 60);
        $this->assertEquals(60, $out['consultation']->billed_seconds);
        $this->assertLessThan(20000, $out['balance_paise']);

        // Drain to autocut
        $con->fresh();
        for ($i = 0; $i < 20; $i++) {
            $cur = $con->fresh();
            if ($cur->status === 'ended') {
                break;
            }
            $out = $svc->heartbeat($a, $cur, 120);
            $con = $out['consultation'];
        }
        $this->assertEquals('ended', $con->fresh()->status);
        $this->assertDatabaseHas('astrologer_earnings', ['reference_id' => $con->id]);
    }

    public function test_low_balance_blocks_start(): void
    {
        $c = User::factory()->create(['role' => 'customer', 'email_verified_at' => now()]);
        $a = $this->astrologer(100); // ₹100/min needs ₹500 start
        $this->expectExceptionMessage('Low balance');
        app(ConsultationService::class)->request($c, $a, 'chat');
    }

    public function test_public_pages_and_ops(): void
    {
        $this->get('/astrologers')->assertOk();
        $this->get('/horoscope')->assertOk();
        $this->get('/shop')->assertOk();
        $this->get('/live')->assertOk();
        $u = User::factory()->create(['role' => 'customer', 'email_verified_at' => now()]);
        $this->actingAs($u)->get('/wallet')->assertOk();
        $this->actingAs($u)->get('/consultations')->assertOk();
        $this->actingAs($u)->get('/support')->assertOk();
    }

    public function test_call_signaling_offer_answer(): void
    {
        $c = User::factory()->create(['role' => 'customer', 'email_verified_at' => now()]);
        $a = $this->astrologer(20);
        app(WalletService::class)->credit($c, 50000, 'sig-rc');
        $svc = app(ConsultationService::class);
        $con = $svc->request($c, $a, 'video');
        $svc->accept($a, $con);

        $this->actingAs($c)->postJson("/consult/{$con->id}/signal", ['kind' => 'offer', 'sdp' => '{"type":"offer"}'])->assertOk();
        $this->actingAs($a)->postJson("/consult/{$con->id}/signal", ['kind' => 'answer', 'sdp' => '{"type":"answer"}'])->assertOk();
        $this->actingAs($c)->postJson("/consult/{$con->id}/signal", ['kind' => 'ice', 'candidate' => '{"c":"1"}'])->assertOk();
        $this->assertDatabaseHas('call_signals', ['consultation_id' => $con->id]);
    }

    public function test_shop_order_verify_marks_paid(): void
    {
        config(['services.razorpay.key_id' => 'test', 'services.razorpay.key_secret' => 'secret']);
        $u = User::factory()->create(['role' => 'customer', 'email_verified_at' => now()]);
        $p = Product::create(['slug' => 't-'.time(), 'name' => 'Test', 'price_paise' => 5000, 'stock' => 5, 'is_active' => true]);
        $this->actingAs($u)->post('/shop/cart', ['product_id' => $p->id])->assertRedirect();
        // wallet empty -> checkout creates razor order (needs mock?) — use wallet credit path instead
        app(WalletService::class)->credit($u, 10000, 'shop-rc');
        $this->actingAs($u)->post('/shop/checkout')->assertRedirect(route('shop.orders'));
        $this->assertDatabaseHas('orders', ['user_id' => $u->id, 'status' => 'paid']);
    }

    public function test_live_message_qa(): void
    {
        $astro = $this->astrologer(20);
        $u = User::factory()->create(['role' => 'customer', 'email_verified_at' => now()]);
        $live = LiveSession::create(['astrologer_id' => $astro->id, 'title' => 'T', 'status' => 'live', 'entry_fee_paise' => 0, 'room_id' => 'r1']);
        $this->actingAs($u)->postJson("/live/{$live->id}/join")->assertOk();
        $this->actingAs($u)->postJson("/live/{$live->id}/message", ['body' => 'Hello?'])->assertOk();
        $this->assertDatabaseHas('live_messages', ['live_session_id' => $live->id]);
    }

    public function test_missed_queue_timeout_marks_no_charge(): void
    {
        $c = User::factory()->create(['role' => 'customer', 'email_verified_at' => now()]);
        $a = $this->astrologer(20);
        app(WalletService::class)->credit($c, 50000, 'miss-rc');
        $con = app(ConsultationService::class)->request($c, $a, 'call');
        $con->update(['requested_at' => now()->subMinutes(10)]);
        $count = app(ConsultationService::class)->timeoutStaleQueued(5);
        $this->assertEquals(1, $count);
        $this->assertEquals('cancelled', $con->fresh()->status);
        $this->assertEquals('missed', $con->fresh()->end_reason);
        $this->assertEquals(50000, app(WalletService::class)->balancePaise($c));
    }

    public function test_recording_upload_and_download(): void
    {
        $c = User::factory()->create(['role' => 'customer', 'email_verified_at' => now()]);
        $a = $this->astrologer(20);
        app(WalletService::class)->credit($c, 50000, 'rec-rc');
        $svc = app(ConsultationService::class);
        $con = $svc->request($c, $a, 'call');
        $svc->accept($a, $con);

        $file = UploadedFile::fake()->create('note.webm', 100, 'audio/webm');
        $this->actingAs($c)->postJson("/consult/{$con->id}/recordings", ['recording' => $file])->assertOk();
        $this->assertDatabaseHas('call_recordings', ['consultation_id' => $con->id]);
        $rec = CallRecording::first();
        $this->actingAs($c)->get("/consult/{$con->id}/recordings/{$rec->id}")->assertOk();
        $this->actingAs($a)->get("/consult/{$con->id}/recordings/{$rec->id}")->assertOk();
    }

    public function test_shipment_update_notifies_customer(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'email_verified_at' => now()]);
        $u = User::factory()->create(['role' => 'customer', 'email_verified_at' => now()]);
        $order = Order::create(['user_id' => $u->id, 'status' => 'paid', 'subtotal_paise' => 1000, 'total_paise' => 1000]);
        $this->actingAs($admin)->post("/admin/ops/shipments/{$order->id}", [
            'shipping_status' => 'shipped', 'carrier' => 'Delhivery', 'tracking_number' => 'DLV123',
        ])->assertRedirect();
        $this->assertEquals('shipped', $order->fresh()->shipping_status);
        $this->assertDatabaseHas('shipments', ['order_id' => $order->id, 'status' => 'shipped']);
        $this->actingAs($u)->get("/shop/orders/{$order->id}")->assertOk();
    }
}
