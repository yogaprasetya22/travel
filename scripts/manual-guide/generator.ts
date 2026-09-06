import * as fs from 'fs';
import * as path from 'path';
import { BASE_URL, ROOT_DOCS_DIR, USERS } from './config';
import { StepGuide, UserRole } from './types';

export async function ensureLoggedIn(
    page: any,
    context: any,
    role: UserRole,
    currentRole: { value: string | null }
): Promise<void> {
    if (currentRole.value === role) {
        return;
    }

    console.log(`🔑 Berpindah sesi login sebagai: ${USERS[role].label} (${USERS[role].email})...`);
    await context.clearCookies();
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');

    if (await emailInput.isVisible()) {
        await emailInput.fill(USERS[role].email);
        await passwordInput.fill(USERS[role].password);
        await page.locator('button[type="submit"]').click();
        await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
        await page.waitForTimeout(1500);
        currentRole.value = role;
        console.log(`✅ Berhasil masuk sebagai ${USERS[role].label}.`);
    }
}

export async function setAppTheme(page: any, mode: 'light' | 'dark'): Promise<void> {
    const themeKey = mode === 'dark' ? 'luxury' : 'caramellatte';
    let themeDef: any = null;
    try {
        const themeJsonPath = path.resolve(__dirname, '../../resources/js/lib/theme-colors.json');
        if (fs.existsSync(themeJsonPath)) {
            const raw = fs.readFileSync(themeJsonPath, 'utf-8');
            const parsed = JSON.parse(raw);
            themeDef = parsed?.themes?.[themeKey] || null;
        }
    } catch {
        themeDef = null;
    }

    await page.evaluate(({ key, def }: { key: string; def: any }) => {
        localStorage.setItem('theme_preference', key);
        const root = document.documentElement;
        if (def && def.variables) {
            Object.entries(def.variables).forEach(([prop, val]) => {
                root.style.setProperty(prop, val as string);
            });
        }
        if (key === 'luxury' || def?.type === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.remove('dark');
            root.classList.add('light');
        }
    }, { key: themeKey, def: themeDef });
    await page.waitForTimeout(400);
}

export async function generateRoleSection(
    page: any,
    context: any,
    roleKey: 'owner' | 'agent',
    modules: StepGuide[],
    currentRole: { value: string | null }
): Promise<void> {
    const roleTitle = roleKey === 'owner' ? 'Owner Travel (Level 1)' : 'Mitra Agen (Level 2/3)';
    const targetDir = path.join(ROOT_DOCS_DIR, roleKey);
    const ssDir = path.join(targetDir, 'screenshots');
    const ssDirLight = path.join(ssDir, 'light');
    const ssDirDark = path.join(ssDir, 'dark');

    // Clean existing directory to prevent old files
    if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
    }
    fs.mkdirSync(ssDirLight, { recursive: true });
    fs.mkdirSync(ssDirDark, { recursive: true });

    console.log(`\n======================================================`);
    console.log(`📘 MENYUSUN PANDUAN: ${roleTitle.toUpperCase()}`);
    console.log(`📁 Folder: ${targetDir}`);
    console.log(`======================================================\n`);

    let readmeContent = `# 📖 BUKU PANDUAN PENGGUNA: ${roleTitle.toUpperCase()}\n\n`;
    readmeContent += `**Sistem Manajemen Operasional & CRM Travel Umroh Multi-Tenant**\n\n`;
    readmeContent += `Panduan ini memuat seluruh panduan langkah demi langkah, operasi CRUD lengkap, dan tata kelola sistem khusus untuk peran **${roleTitle}**.\n\n`;
    readmeContent += `---\n\n## 🗺️ Alur Perjalanan Kerja (End-to-End Workflow)\n\n`;

    if (roleKey === 'owner') {
        readmeContent += `### Roadmap Kerja Owner Travel (Level 1):\n`;
        readmeContent += `1. **Setup & Master Data**: Menyiapkan profil travel, tema landing page, rekening bank resmi, dan katalog paket umroh.\n`;
        readmeContent += `2. **Manajemen Mitra Agen**: Menerima pendaftaran agen baru, menyetujui akun, dan menentukan struktur komisi.\n`;
        readmeContent += `3. **Pengawasan Pipa Prospek (CRM)**: Memonitor seluruh prospek jamaah di papan Kanban global dan memverifikasi berkas paspor/visa.\n`;
        readmeContent += `4. **Kasir & Pelunasan**: Memvalidasi bukti transfer bank DP/Pelunasan jamaah dan menerbitkan kuitansi/invoice resmi.\n`;
        readmeContent += `5. **Operasional & Logistik**: Menyiapkan koper/perlengkapan di gudang, mencatat serah terima, dan mengunci manifest seat penerbangan.\n`;
        readmeContent += `6. **Pencairan Komisi**: Mentransfer hak bagi hasil komisi kepada mitra agen yang jamaahnya sudah lunas.\n\n`;
    } else {
        readmeContent += `### Roadmap Kerja Mitra Agen (Level 2/3):\n`;
        readmeContent += `1. **Setup Bio Link Mandiri**: Melengkapi foto profil, bio komitmen pelayanan, dan tombol WhatsApp di \`/profile\`.\n`;
        readmeContent += `2. **Promosi & Akuisisi Leads**: Menyebarkan tautan Bio Link personal (\`/agen/AG-XXX\`) dan Link Referral Form ke media sosial untuk menjaring calon jamaah secara otomatis.\n`;
        readmeContent += `3. **Pendaftaran Jamaah**: Mendaftarkan calon jamaah langsung ke sistem atau menerima leads via referral code agen.\n`;
        readmeContent += `4. **Pengawalan CRM**: Mengawal kelengkapan berkas jamaah binaan (Paspor, KTP, Buku Nikah, Vaksin) di papan Kanban.\n`;
        readmeContent += `5. **Pembayaran & Closing**: Mengarahkan jamaah melakukan transfer ke rekening resmi travel dan mengunggah bukti bayar.\n`;
        readmeContent += `6. **Pencairan Komisi**: Memonitor akumulasi saldo komisi langsung dan komisi override sub-agen hingga dicairkan oleh kantor pusat.\n\n`;
    }

    readmeContent += `---\n\n## 📑 Daftar Modul & Panduan Lengkap\n\n`;

    for (let i = 0; i < modules.length; i++) {
        const mod = modules[i];
        const orderNum = String(i + 1).padStart(2, '0');
        console.log(`📸 [${orderNum}/${modules.length}] [${roleKey.toUpperCase()}] Mengambil data: ${mod.title}...`);

        // If not a full external url, ensure user is logged in
        if (!mod.route.startsWith('http://barokah') && !mod.route.startsWith('https://')) {
            await ensureLoggedIn(page, context, mod.loginAs, currentRole);
        }

        const targetUrl = mod.route.startsWith('http') ? mod.route : `${BASE_URL}${mod.route}`;
        await page.goto(targetUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);

        const ssFilename = `${mod.id}.webp`;

        // 1. Capture Light Mode Screenshot
        await setAppTheme(page, 'light');
        await page.screenshot({ path: path.join(ssDirLight, ssFilename), fullPage: false, type: 'webp', quality: 85 });

        // 2. Capture Dark Mode Screenshot
        await setAppTheme(page, 'dark');
        await page.screenshot({ path: path.join(ssDirDark, ssFilename), fullPage: false, type: 'webp', quality: 85 });

        if (mod.actions) {
            // 1. Run Action in Light Mode
            try {
                await setAppTheme(page, 'light');
                await mod.actions(page, ssDirLight);
            } catch (err: any) {
                console.log(`   ⚠️ Info aksi modul (light): ${err.message}`);
            }

            // 2. Reload page & Run Action in Dark Mode
            try {
                await page.goto(targetUrl, { waitUntil: 'networkidle' });
                await page.waitForTimeout(800);
                await setAppTheme(page, 'dark');
                await mod.actions(page, ssDirDark);
            } catch (err: any) {
                console.log(`   ⚠️ Info aksi modul (dark): ${err.message}`);
            }
        }

        // Check for any additional screenshots taken by actions (stored in light/ and dark/)
        const extraLightScreenshots = fs.existsSync(ssDirLight)
            ? fs.readdirSync(ssDirLight).filter((file) => file.startsWith(`${mod.id}_`) && (file.endsWith('.webp') || file.endsWith('.png')))
            : [];

        const fileBasename = `${orderNum}_${mod.id.toUpperCase()}.md`;
        const filePath = path.join(targetDir, fileBasename);

        let docContent = `# ${mod.title}\n\n`;
        docContent += `> **Target Peran**: \`${mod.targetRole}\` | **Login Akun**: \`${USERS[mod.loginAs].email}\`\n`;
        docContent += `> **Tahapan Alur**: \`${mod.workflowStage}\` | **Kategori**: \`${mod.category}\` | **Rute / URL**: \`${mod.route}\`\n\n`;
        docContent += `## 📋 Deskripsi Fitur\n${mod.description}\n\n`;
        docContent += `## 🖼️ Tampilan Antarmuka Utama\n\n`;
        docContent += `![Tampilan ${mod.title} (Light)](screenshots/light/${ssFilename}#gh-light-mode-only)\n`;
        docContent += `![Tampilan ${mod.title} (Dark)](screenshots/dark/${ssFilename}#gh-dark-mode-only)\n\n`;

        if (extraLightScreenshots.length > 0) {
            docContent += `## 🗂️ Tampilan Drawer, Modal & Aksi Detail\n\n`;
            for (const extra of extraLightScreenshots) {
                const actionLabel = extra
                    .replace(`${mod.id}_`, '')
                    .replace(/\.(webp|png)$/, '')
                    .replace(/_(light|dark)$/, '')
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase());
                docContent += `### 📸 Tampilan ${actionLabel}\n\n`;
                docContent += `![Tampilan ${actionLabel} (Light)](screenshots/light/${extra}#gh-light-mode-only)\n`;
                docContent += `![Tampilan ${actionLabel} (Dark)](screenshots/dark/${extra}#gh-dark-mode-only)\n\n`;
            }
        }

        docContent += `## ⚡ Aksi & Fitur Lengkap (CRUD Matrix)\n\n`;
        if (mod.crudActions.create && mod.crudActions.create.length > 0) {
            docContent += `### ➕ Create (Tambah / Input Baru)\n`;
            mod.crudActions.create.forEach(item => { docContent += `- ${item}\n`; });
            docContent += `\n`;
        }
        if (mod.crudActions.read && mod.crudActions.read.length > 0) {
            docContent += `### 🔍 Read (Lihat / Pencarian / Filter Data)\n`;
            mod.crudActions.read.forEach(item => { docContent += `- ${item}\n`; });
            docContent += `\n`;
        }
        if (mod.crudActions.update && mod.crudActions.update.length > 0) {
            docContent += `### ✏️ Update (Edit / Pembaruan Status)\n`;
            mod.crudActions.update.forEach(item => { docContent += `- ${item}\n`; });
            docContent += `\n`;
        }
        if (mod.crudActions.delete && mod.crudActions.delete.length > 0) {
            docContent += `### 🗑️ Delete (Hapus Data)\n`;
            mod.crudActions.delete.forEach(item => { docContent += `- ${item}\n`; });
            docContent += `\n`;
        }
        if (mod.crudActions.special && mod.crudActions.special.length > 0) {
            docContent += `### ✨ Fitur Khusus & Otomasi\n`;
            mod.crudActions.special.forEach(item => { docContent += `- ${item}\n`; });
            docContent += `\n`;
        }

        docContent += `## 🛠️ Langkah-Langkah Penggunaan\n\n`;
        mod.steps.forEach((step, idx) => {
            docContent += `${idx + 1}. ${step}\n`;
        });
        docContent += `\n`;

        if (mod.tips && mod.tips.length > 0) {
            docContent += `## 💡 Tips & Catatan Penting\n\n`;
            mod.tips.forEach((tip) => {
                docContent += `- 💡 ${tip}\n`;
            });
            docContent += `\n`;
        }

        docContent += `---\n*Buku Panduan Resmi Sistem Travel Umroh Multi-Tenant.*\n`;

        fs.writeFileSync(filePath, docContent, 'utf-8');

        readmeContent += `### ${orderNum}. [${mod.title}](${fileBasename})\n`;
        readmeContent += `- **Fase**: ${mod.workflowStage}\n`;
        readmeContent += `- **Kategori**: ${mod.category}\n`;
        readmeContent += `- **Deskripsi**: ${mod.description}\n\n`;
    }

    fs.writeFileSync(path.join(targetDir, 'README.md'), readmeContent, 'utf-8');
}
