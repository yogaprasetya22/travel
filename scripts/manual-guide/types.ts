export type UserRole = 'superadmin' | 'agent' | 'superadmin_master';
export type TargetRoleTitle = 'Owner (Level 1)' | 'Mitra Agen (Level 2/3)' | 'Superadmin Master';

export interface CrudActions {
    create?: string[];
    read?: string[];
    update?: string[];
    delete?: string[];
    special?: string[];
}

export interface StepGuide {
    id: string;
    category: string;
    title: string;
    targetRole: TargetRoleTitle;
    loginAs: UserRole;
    workflowStage: string;
    route: string;
    description: string;
    crudActions: CrudActions;
    actions?: (page: any, screenshotsDir: string) => Promise<void>;
    steps: string[];
    tips?: string[];
}

export interface UserCredential {
    email: string;
    password: string;
    label: string;
}
