<?php

namespace Database\Factories;

use App\Models\Penerbangan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Penerbangan>
 */
class PenerbanganFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'maskapai' => 'Saudia',
            'nomor_penerbangan' => 'SV'.fake()->numerify('###'),
            'bandara_asal' => 'CGK',
            'bandara_tujuan' => 'JED',
            'sumber' => 'manual',
        ];
    }
}
