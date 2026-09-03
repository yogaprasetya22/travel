<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        @php
            $themeData = json_decode(file_get_contents(resource_path('js/lib/theme-colors.json')), true)['themes'] ?? [];
        @endphp

        <!-- Anti-Flicker Instant Theme Script (Zero-Latency Theme & CSS Vars Injection) -->
        <script>
            (function() {
                try {
                    var themes = @json($themeData);
                    var pref = localStorage.getItem('theme_preference') || 'luxury';
                    if (pref === 'system') {
                        pref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'luxury' : 'caramellatte';
                    } else if (pref === 'dark') {
                        pref = 'luxury';
                    } else if (pref === 'light') {
                        pref = 'caramellatte';
                    }
                    var activeTheme = themes[pref] || themes['luxury'] || themes['caramellatte'];
                    if (activeTheme) {
                        var root = document.documentElement;
                        if (activeTheme.type === 'dark') {
                            root.classList.add('dark');
                            root.classList.remove('light');
                        } else {
                            root.classList.remove('dark');
                            root.classList.add('light');
                        }
                        if (activeTheme.variables) {
                            for (var key in activeTheme.variables) {
                                root.style.setProperty(key, activeTheme.variables[key]);
                            }
                        }
                    }
                } catch (e) {
                    document.documentElement.classList.add('dark');
                }
            })();
        </script>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-background text-foreground min-h-screen">
        @inertia
    </body>
</html>
