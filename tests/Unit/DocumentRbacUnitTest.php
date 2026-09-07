<?php

namespace Tests\Unit;

use App\Models\DocumentPermission;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocumentRbacUnitTest extends TestCase
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

    public function test_document_permission_matrix_creation_and_attributes(): void
    {
        $perm = DocumentPermission::create([
            'tenant_id' => $this->tenant->id,
            'role_name' => 'staff',
            'document_type' => 'siskopatuh',
            'can_view' => true,
            'can_upload' => true,
            'can_delete' => false,
        ]);

        $this->assertTrue($perm->can_view);
        $this->assertTrue($perm->can_upload);
        $this->assertFalse($perm->can_delete);
        $this->assertEquals('staff', $perm->role_name);
        $this->assertEquals('siskopatuh', $perm->document_type);
    }

    public function test_document_permission_unique_constraint_or_update(): void
    {
        DocumentPermission::updateOrCreate(
            [
                'tenant_id' => $this->tenant->id,
                'role_name' => 'agen',
                'document_type' => 'paspor',
            ],
            [
                'can_view' => true,
                'can_upload' => false,
                'can_delete' => false,
            ]
        );

        // Update permissions
        DocumentPermission::updateOrCreate(
            [
                'tenant_id' => $this->tenant->id,
                'role_name' => 'agen',
                'document_type' => 'paspor',
            ],
            [
                'can_view' => true,
                'can_upload' => true,
                'can_delete' => false,
            ]
        );

        $this->assertEquals(1, DocumentPermission::where('role_name', 'agen')->where('document_type', 'paspor')->count());
        $this->assertTrue(DocumentPermission::where('role_name', 'agen')->where('document_type', 'paspor')->first()->can_upload);
    }
}
