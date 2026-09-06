import * as path from 'path';
import { UserCredential, UserRole } from './types';

export const BASE_URL = process.env.GUIDE_BASE_URL || 'http://localhost:8000';
export const ROOT_DOCS_DIR = path.resolve(process.cwd(), 'docs/manual-guide');

export const USERS: Record<UserRole, UserCredential> = {
    superadmin_master: {
        email: 'superadmin@hajjflow.com',
        password: 'password',
        label: 'Super Admin Master Platform'
    },
    superadmin: {
        email: 'test@example.com',
        password: 'password',
        label: 'Owner / Superadmin (Level 1)'
    },
    agent: {
        email: 'budi@example.com',
        password: 'password',
        label: 'Mitra Agen (Level 2/3)'
    }
};
