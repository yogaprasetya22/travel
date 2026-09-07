<?php

namespace Tests\Unit;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserHierarchyUnitTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'nama_travel' => 'Berkah Travel Test',
            'domain_atau_subdomain' => 'berkahtest',
        ]);
    }

    public function test_get_downline_user_ids_recursive_multi_level(): void
    {
        // Level 1: Leader
        $leader = User::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Leader Utama',
            'email' => 'leader@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin_travel',
            'jabatan' => 'Leader',
        ]);

        // Level 2: Agent under Leader
        $agentLevel1 = User::create([
            'tenant_id' => $this->tenant->id,
            'created_by' => $leader->id,
            'name' => 'Agen Cabang 1',
            'email' => 'agencabang1@example.com',
            'password' => bcrypt('password'),
            'role' => 'agen',
        ]);

        $agentLevel1B = User::create([
            'tenant_id' => $this->tenant->id,
            'created_by' => $leader->id,
            'name' => 'Agen Cabang 2',
            'email' => 'agencabang2@example.com',
            'password' => bcrypt('password'),
            'role' => 'agen',
        ]);

        // Level 3: Sub-Agent under Agent 1
        $subAgent = User::create([
            'tenant_id' => $this->tenant->id,
            'created_by' => $agentLevel1->id,
            'name' => 'Sub Agen Pratama',
            'email' => 'subagen@example.com',
            'password' => bcrypt('password'),
            'role' => 'agen',
        ]);

        // Level 4: Freelance agent under Sub-Agent
        $subSubAgent = User::create([
            'tenant_id' => $this->tenant->id,
            'created_by' => $subAgent->id,
            'name' => 'Freelance Marketer',
            'email' => 'freelance@example.com',
            'password' => bcrypt('password'),
            'role' => 'agen',
        ]);

        // Leader should see all 4 downlines
        $leaderDownlines = $leader->getDownlineUserIds();
        $this->assertCount(4, $leaderDownlines);
        $this->assertContains($agentLevel1->id, $leaderDownlines);
        $this->assertContains($agentLevel1B->id, $leaderDownlines);
        $this->assertContains($subAgent->id, $leaderDownlines);
        $this->assertContains($subSubAgent->id, $leaderDownlines);

        // Agent 1 should see subAgent and subSubAgent (2 downlines)
        $agent1Downlines = $agentLevel1->getDownlineUserIds();
        $this->assertCount(2, $agent1Downlines);
        $this->assertContains($subAgent->id, $agent1Downlines);
        $this->assertContains($subSubAgent->id, $agent1Downlines);
        $this->assertNotContains($agentLevel1B->id, $agent1Downlines);

        // SubSubAgent has 0 downlines
        $this->assertEmpty($subSubAgent->getDownlineUserIds());
    }

    public function test_get_downline_user_ids_cycle_protection(): void
    {
        $userA = User::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'User A',
            'email' => 'usera@example.com',
            'password' => bcrypt('password'),
            'role' => 'agen',
        ]);

        $downlines = $userA->getDownlineUserIds();
        $this->assertIsArray($downlines);
        $this->assertEmpty($downlines);
    }
}
