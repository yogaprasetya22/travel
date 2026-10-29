<?php

namespace Database\Factories;

use App\Models\Hotel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Hotel>
 */
class HotelFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nama' => fake()->company().' Hotel',
            'kota' => fake()->randomElement(['Makkah', 'Madinah']),
            'bintang' => fake()->numberBetween(3, 5),
            'sumber' => 'manual',
        ];
    }
}
