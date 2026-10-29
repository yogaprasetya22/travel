<?php

namespace Database\Seeders;

/**
 * Seed lengkap hanya untuk tenant Setia Haramain Tour (login: setiaharamaintour@travel.id).
 * Data tenant ini juga ikut di TenantDatasetSeeder; kelas ini untuk menjalankannya sendirian.
 */
class SetiaHaramainTourSeeder extends TenantDatasetSeeder
{
    protected array $onlySubdomains = ['setiaharamaintour'];
}
