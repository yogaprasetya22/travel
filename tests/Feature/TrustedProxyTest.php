<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class TrustedProxyTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Route::get('/__scheme', fn () => request()->isSecure() ? 'https' : 'http');
    }

    public function test_forwarded_proto_is_honoured_from_private_proxy(): void
    {
        $this->withServerVariables(['REMOTE_ADDR' => '172.18.0.5'])
            ->get('/__scheme', ['X-Forwarded-Proto' => 'https'])
            ->assertContent('https');
    }

    public function test_forwarded_proto_is_ignored_from_public_address(): void
    {
        $this->withServerVariables(['REMOTE_ADDR' => '8.8.8.8'])
            ->get('/__scheme', ['X-Forwarded-Proto' => 'https'])
            ->assertContent('http');
    }
}
