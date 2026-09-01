<?php

namespace App\Enums;

enum HierarchyRank: int
{
    case SUPER_ADMIN = 0;
    case OWNER = 1;
    case SUPERVISOR = 2;
    case TEAM_LEADER = 3;
    case STAFF_AGEN = 4;

    public function label(): string
    {
        return match ($this) {
            self::SUPER_ADMIN => 'Super Admin Master',
            self::OWNER => 'Owner Travel',
            self::SUPERVISOR => 'Supervisor',
            self::TEAM_LEADER => 'Team Leader',
            self::STAFF_AGEN => 'Staff (Mitra Agen)',
        };
    }

    public function badgeClass(): string
    {
        return match ($this) {
            self::SUPER_ADMIN => 'bg-purple-500/10 text-purple-600 border-purple-500/20',
            self::OWNER => 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
            self::SUPERVISOR => 'bg-sky-500/10 text-sky-600 border-sky-500/20',
            self::TEAM_LEADER => 'bg-amber-500/10 text-amber-600 border-amber-500/20',
            self::STAFF_AGEN => 'bg-slate-500/10 text-slate-600 border-slate-500/20',
        };
    }

    public static function fromLevel(int $level): self
    {
        return match ($level) {
            0 => self::SUPER_ADMIN,
            1 => self::OWNER,
            2 => self::SUPERVISOR,
            3 => self::TEAM_LEADER,
            default => self::STAFF_AGEN,
        };
    }
}
