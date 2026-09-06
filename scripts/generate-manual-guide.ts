import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { BASE_URL, ROOT_DOCS_DIR, USERS } from './manual-guide/config';
import { OWNER_MODULES } from './manual-guide/modules/owner';
import { AGENT_MODULES } from './manual-guide/modules/agent';
import { generateRoleSection } from './manual-guide/generator';

async function run() {
    console.log(`\n🚀 Memulai Otomasi Scraper Manual Guide (Modular Architecture)...`);
    console.log(`📍 Target Server: ${BASE_URL}`);
    console.log(`📁 Root Output: ${ROOT_DOCS_DIR}\n`);

    fs.mkdirSync(ROOT_DOCS_DIR, { recursive: true });

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2
    });

    const page = await context.newPage();
    const currentRole: { value: string | null } = { value: null };

    try {
        // 1. Generate Owner Guide
        await generateRoleSection(page, context, 'owner', OWNER_MODULES, currentRole);

        // 2. Generate Agent Guide
        await generateRoleSection(page, context, 'agent', AGENT_MODULES, currentRole);

        // 3. Generate Master Landing README in ROOT_DOCS_DIR
        let rootReadme = `# 📖 PORTAL DOKUMENTASI & PANDUAN PENGGUNA (USER MANUAL GUIDE)\n\n`;
        rootReadme += `**Sistem Informasi & Manajemen Operasional Travel Umroh Multi-Tenant**\n\n`;
        rootReadme += `Selamat datang di portal dokumentasi resmi. Dokumentasi telah dipisahkan ke dalam 2 panduan khusus berdasarkan peran dan wewenang pengguna:\n\n`;
        rootReadme += `### 🏢 [1. Buku Panduan Khusus Owner Travel (Level 1)](owner/README.md)\n`;
        rootReadme += `> Panduan komprehensif untuk Direktur / Owner Travel, Staf Operasional, Keuangan, dan Kasir. Mencakup setup master paket umroh, rekening bank, verifikasi kasir, pembagian komisi, logistik gudang, dan hierarki keagenan.\n\n`;
        rootReadme += `### 🤝 [2. Buku Panduan Khusus Mitra Agen (Level 2/3)](agent/README.md)\n`;
        rootReadme += `> Panduan praktis untuk Konsultan & Mitra Agen Umroh. Mencakup kustomisasi Bio Link landing page personal di \`/profile\`, penyebaran link referral ke publik (\`/agen/AG-XXX\`), formulir pendaftaran online (\`/daftar?ref=...\`), input calon jamaah, pengawalan berkas paspor di CRM, dan pemantauan komisi penjualan.\n\n`;
        rootReadme += `---\n\n`;
        rootReadme += `### 🔑 Akun Akses Demo:\n`;
        rootReadme += `- **Superadmin Master Platform**: \`${USERS.superadmin_master.email}\` | Password: \`${USERS.superadmin_master.password}\`\n`;
        rootReadme += `- **Owner / Superadmin (Level 1)**: \`${USERS.superadmin.email}\` | Password: \`${USERS.superadmin.password}\`\n`;
        rootReadme += `- **Mitra Agen (Level 2/3)**: \`${USERS.agent.email}\` | Password: \`${USERS.agent.password}\`\n\n`;

        fs.writeFileSync(path.join(ROOT_DOCS_DIR, 'README.md'), rootReadme, 'utf-8');
        console.log(`\n✨ Selesai! Seluruh panduan owner dan agen telah berhasil disusun dengan rapi di: ${ROOT_DOCS_DIR}\n`);

    } catch (error: any) {
        console.error(`❌ Terjadi kesalahan saat scraping panduan:`, error);
    } finally {
        await browser.close();
    }
}

run();
