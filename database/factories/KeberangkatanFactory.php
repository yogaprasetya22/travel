<?php

namespace Database\Factories;

use App\Models\Keberangkatan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Keberangkatan>
 */
class KeberangkatanFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $berangkat = fake()->dateTimeBetween('+1 month', '+6 months');

        return [
            'kode' => 'KBR-'.strtoupper(fake()->unique()->bothify('??###')),
            'tanggal_berangkat' => $berangkat->format('Y-m-d'),
            'tanggal_pulang' => (clone $berangkat)->modify('+9 days')->format('Y-m-d'),
            'status' => 'Terbuka',
            'kuota' => 45,
            'muthawwif' => 'Ustadz Fauzan Hakim, Lc',
            'transportasi' => 'Bus AC Full',
        ];
    }
}
