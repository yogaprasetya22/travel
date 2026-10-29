<?php

namespace Tests\Feature;

use App\Models\Tenant;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class DocsTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        Tenant::create(['nama_travel' => 'Test Travel', 'domain_atau_subdomain' => 'docs-test', 'is_docs_enabled' => true]);
    }

    public function test_portal_readme_has_no_demo_credentials(): void
    {
        $this->get('/docs')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Docs/Index')
                ->where('currentRole', 'portal')
                ->where('activeDoc.html', fn ($html) => ! str_contains($html, 'password') && ! str_contains($html, '@example.com')));
    }

    public function test_article_exposes_front_matter_without_rendering_it(): void
    {
        $this->get('/docs/owner/10_05_JADWAL_KEBERANGKATAN')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('activeDoc.title', 'Jadwal Keberangkatan')
                ->where('activeDoc.meta.peran', 'Owner')
                ->where('activeDoc.meta.halaman', '/crm/schedules')
                ->where('activeDoc.html', fn ($html) => ! str_contains($html, 'peran:') && str_contains($html, '<h1>')));
    }

    public function test_navigation_uses_front_matter_category_and_includes_departure_package_page(): void
    {
        $this->get('/docs/owner')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('navigation.owner', fn ($items) => collect($items)->contains(
                    fn ($item) => $item['slug'] === '10_05_PAKET_KEBERANGKATAN' && $item['category'] === 'Operasional'
                )));
    }

    public function test_guides_contain_no_emoji_or_boilerplate(): void
    {
        foreach (glob(base_path('docs/manual-guide/*/*.md')) as $file) {
            $content = file_get_contents($file);

            $this->assertDoesNotMatchRegularExpression('/[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]/u', $content, $file);
            $this->assertStringNotContainsString('CRUD Matrix', $content, $file);
            $this->assertStringNotContainsString('Buku Panduan Resmi', $content, $file);
        }
    }
}
