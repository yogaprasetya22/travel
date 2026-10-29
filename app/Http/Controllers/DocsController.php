<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DocsController extends Controller
{
    private string $docsBasePath;

    public function __construct()
    {
        $this->docsBasePath = base_path('docs/manual-guide');
    }

    /**
     * Resolve tenant information for branding.
     */
    private function resolveTenant(Request $request): ?Tenant
    {
        if (app()->bound('tenant')) {
            return app('tenant');
        }

        $host = $request->getHost();
        $subdomain = explode('.', $host)[0];

        $tenant = Tenant::where('domain_atau_subdomain', $subdomain)->first();

        return $tenant ?: Tenant::oldest('id')->first();
    }

    /**
     * Display the documentation viewer.
     */
    public function index(Request $request, ?string $role = null, ?string $slug = null): Response
    {
        $tenant = $this->resolveTenant($request);
        $user = Auth::user();

        // Check if Docs feature is disabled for this tenant (unless Super Admin Master)
        if ($tenant && ! $tenant->is_docs_enabled && (! $user || $user->role !== 'super_admin_master')) {
            abort(403, 'Fitur buku panduan dan dokumentasi dinonaktifkan oleh administrator untuk travel ini.');
        }

        // 1. Determine Default Role if not specified
        if (! $role || ! in_array(strtolower($role), ['owner', 'agent', 'portal'])) {
            if ($user && in_array($user->role, ['agen', 'team_leader'])) {
                $role = 'agent';
            } elseif ($user && in_array($user->role, ['super_admin_master', 'owner_travel', 'supervisor', 'admin_travel'])) {
                $role = 'owner';
            } else {
                $role = 'portal';
            }
        } else {
            $role = strtolower($role);
        }

        // 2. Build Navigation Tree for Owner & Agent
        $navigation = [
            'owner' => $this->getNavigationTree('owner'),
            'agent' => $this->getNavigationTree('agent'),
        ];

        // 3. Resolve Active Document
        $activeDoc = null;
        if ($role === 'portal') {
            $portalPath = $this->docsBasePath.'/README.md';
            if (File::exists($portalPath)) {
                $activeDoc = $this->parseMarkdownFile($portalPath, 'portal', 'README');
            }
        } else {
            $roleNav = $navigation[$role] ?? [];
            $targetFile = null;

            if ($slug) {
                // Find matching file in current role nav
                foreach ($roleNav as $item) {
                    if ($item['slug'] === $slug) {
                        $targetFile = $item['filepath'];
                        break;
                    }
                }
            }

            // Fallback to README.md or first available item
            if (! $targetFile || ! File::exists($targetFile)) {
                $readmePath = $this->docsBasePath."/{$role}/README.md";
                if (File::exists($readmePath)) {
                    $targetFile = $readmePath;
                    $slug = 'overview';
                } elseif (! empty($roleNav)) {
                    $targetFile = $roleNav[0]['filepath'];
                    $slug = $roleNav[0]['slug'];
                }
            }

            if ($targetFile && File::exists($targetFile)) {
                $activeDoc = $this->parseMarkdownFile($targetFile, $role, $slug ?: 'overview');
            }
        }

        return Inertia::render('Docs/Index', [
            'tenant' => $tenant,
            'currentRole' => $role,
            'currentSlug' => $slug ?: ($role === 'portal' ? 'portal' : 'overview'),
            'navigation' => $navigation,
            'activeDoc' => $activeDoc,
            'isAuthenticated' => Auth::check(),
            'currentUser' => $user ? [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ] : null,
        ]);
    }

    /**
     * Get sorted navigation items for a specific role folder.
     */
    private function getNavigationTree(string $role): array
    {
        $dir = $this->docsBasePath.'/'.$role;
        if (! File::isDirectory($dir)) {
            return [];
        }

        $files = File::files($dir);
        $items = [];

        // Check for overview README
        $readmePath = $dir.'/README.md';
        if (File::exists($readmePath)) {
            $items[] = [
                'title' => 'Ringkasan',
                'slug' => 'overview',
                'order' => 0,
                'category' => 'Mulai di sini',
                'filepath' => $readmePath,
            ];
        }

        foreach ($files as $file) {
            $filename = $file->getFilename();
            if ($filename === 'README.md' || $file->getExtension() !== 'md') {
                continue;
            }

            $slug = pathinfo($filename, PATHINFO_FILENAME);
            [$meta, $content] = $this->splitFrontMatter(File::get($file->getRealPath()));

            // Extract Title from first # Heading
            preg_match('/^#\s+(.+)$/m', $content, $titleMatch);
            $title = $titleMatch[1] ?? Str::headline(str_replace('_', ' ', $slug));

            $category = $meta['kategori'] ?? 'Lainnya';

            // Extract Order Number
            preg_match('/^(\d+)_/i', $filename, $orderMatch);
            $order = isset($orderMatch[1]) ? (int) $orderMatch[1] : 99;

            $items[] = [
                'title' => $title,
                'slug' => $slug,
                'order' => $order,
                'category' => $category,
                'filepath' => $file->getRealPath(),
            ];
        }

        usort($items, fn ($a, $b) => $a['order'] <=> $b['order']);

        return $items;
    }

    /**
     * Pisahkan front matter sederhana (`kunci: nilai`) dari isi markdown.
     *
     * @return array{0: array<string, string>, 1: string}
     */
    private function splitFrontMatter(string $raw): array
    {
        if (! preg_match('/\A---\R(.*?)\R---\R*(.*)\z/s', $raw, $parts)) {
            return [[], $raw];
        }

        $meta = [];
        foreach (preg_split('/\R/', $parts[1]) as $line) {
            if (str_contains($line, ':')) {
                [$key, $value] = explode(':', $line, 2);
                $meta[trim($key)] = trim($value);
            }
        }

        return [$meta, $parts[2]];
    }

    /**
     * Parse markdown file and prepare safe HTML with updated image asset paths.
     */
    private function parseMarkdownFile(string $filepath, string $role, string $slug): array
    {
        [$meta, $rawMarkdown] = $this->splitFrontMatter(File::get($filepath));

        // Rewrite relative image paths e.g. "screenshots/xxx.png" -> "/docs-assets/{role}/screenshots/xxx.png"
        $processedMarkdown = preg_replace(
            '/!\[(.*?)\]\(screenshots\/(.*?)\)/',
            '![$1](/docs-assets/'.$role.'/screenshots/$2)',
            $rawMarkdown
        );

        // Rewrite relative file links e.g. [title](01_01_XXX.md) -> /docs/{role}/01_01_XXX
        $processedMarkdown = preg_replace_callback(
            '/\[(.*?)\]\(([0-9a-zA-Z_\-]+)\.md\)/',
            function ($matches) use ($role) {
                $targetSlug = ($matches[2] === 'README') ? 'overview' : $matches[2];

                return "[{$matches[1]}](/docs/{$role}/{$targetSlug})";
            },
            $processedMarkdown
        );

        // Extract Headings for Table of Contents (H2 & H3) with clean slugs
        $headings = [];
        preg_match_all('/^(#{2,3})\s+(.+)$/m', $rawMarkdown, $matches, PREG_SET_ORDER);
        foreach ($matches as $match) {
            $level = strlen($match[1]);
            $title = trim($match[2]);
            $cleanTitle = preg_replace('/[\x{1F600}-\x{1F64F}\x{1F300}-\x{1F5FF}\x{1F680}-\x{1F6FF}\x{1F1E0}-\x{1F1FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}]/u', '', $title);
            $anchor = Str::slug(trim($cleanTitle)) ?: Str::slug($title) ?: 'section-'.uniqid();
            $headings[] = [
                'level' => $level,
                'title' => $title,
                'anchor' => $anchor,
            ];
        }

        // Extract metadata header block
        preg_match('/^#\s+(.+)$/m', $rawMarkdown, $titleMatch);
        $title = $titleMatch[1] ?? 'Dokumentasi Sistem';

        // Render to clean HTML
        $htmlContent = Str::markdown($processedMarkdown);

        // Inject id attribute and scroll-margin into rendered HTML headings
        $htmlContent = preg_replace_callback(
            '/<h([2-3])>(.*?)<\/h\1>/',
            function ($matches) {
                $level = $matches[1];
                $rawText = strip_tags($matches[2]);
                $cleanText = preg_replace('/[\x{1F600}-\x{1F64F}\x{1F300}-\x{1F5FF}\x{1F680}-\x{1F6FF}\x{1F1E0}-\x{1F1FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}]/u', '', $rawText);
                $anchor = Str::slug(trim($cleanText)) ?: Str::slug($rawText) ?: 'section-'.uniqid();

                return "<h{$level} id=\"{$anchor}\" class=\"scroll-mt-24 group\">{$matches[2]}<a href=\"#{$anchor}\" class=\"opacity-0 group-hover:opacity-100 transition-opacity\" aria-label=\"Tautan ke bagian ini\">#</a></h{$level}>";
            },
            $htmlContent
        );

        return [
            'title' => $title,
            'slug' => $slug,
            'role' => $role,
            'meta' => $meta,
            'headings' => $headings,
            'html' => $htmlContent,
            'raw' => $processedMarkdown,
        ];
    }

    /**
     * Stream screenshot images safely from docs directory.
     */
    public function asset(string $role, string $file): BinaryFileResponse|HttpResponse
    {
        // Sanitize path to prevent directory traversal
        $safeRole = basename($role);
        $cleanFile = str_replace('..', '', ltrim($file, '/'));

        $assetPath = $this->docsBasePath."/{$safeRole}/screenshots/{$cleanFile}";

        if (! File::exists($assetPath)) {
            abort(404, 'Asset screenshot tidak ditemukan.');
        }

        $mimeType = File::mimeType($assetPath) ?: 'image/webp';

        return response()->file($assetPath, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
