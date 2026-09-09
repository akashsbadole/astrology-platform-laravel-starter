<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use App\Services\ConsultationService;
use App\Services\WalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
