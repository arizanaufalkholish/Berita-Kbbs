# 🚀 Panduan Deploy KBB Sadunia ke Shared Hosting

Panduan lengkap step-by-step untuk deploy website ke shared hosting (cPanel).

---

## 📋 Prasyarat

- **Node.js** v18+ terinstall di komputer lokal ([download](https://nodejs.org))
- **Akses hosting** dengan cPanel / phpMyAdmin
- **Akses SSH** (opsional, untuk membuat admin)
- **MySQL database** sudah dibuat di hosting
- **Domain** `kbb-banjarsadunia.com` sudah diarahkan ke hosting

---

## ⚡ Cara Cepat (Otomatis)

Jalankan script deploy otomatis:

```bash
# Windows
deploy.bat

# Linux/Mac
chmod +x deploy.sh && ./deploy.sh
```

Script ini akan:
1. ✅ Validasi semua file `.env`
2. ✅ Install dependencies
3. ✅ Build frontend
4. ✅ Membuat folder `deploy-package/public_html/` siap upload

Setelah selesai, upload isi `deploy-package/public_html/` ke hosting.

---

## 📖 Cara Manual (Step-by-Step)

### Step 1: Konfigurasi Environment

#### Frontend (.env)
```bash
cd frontend
# Edit file .env (sudah dibuat, pastikan domain benar)
```

File `frontend/.env` sudah dikonfigurasi:
```env
VITE_API_URL=
VITE_SITE_URL=https://kbb-banjarsadunia.com
```

#### Backend (.env)
Edit `backend/.env` dengan kredensial database hosting Anda:
```env
DB_HOST=127.0.0.1
DB_NAME=nama_database_anda
DB_USER=username_database
DB_PASS=password_database
API_SECRET_KEY=string_acak_minimal_32_karakter
APP_ENV=production
FRONTEND_URL=
```

> ⚠️ **PENTING:** `API_SECRET_KEY` harus string acak yang kuat!  
> Generate di browser console: `crypto.randomUUID() + crypto.randomUUID()`

---

### Step 2: Build Frontend

```bash
cd frontend
npm install
npm run build
```

Ini menghasilkan folder `frontend/dist/` yang berisi file production-ready.

---

### Step 3: Setup Database di Hosting

1. Login ke **cPanel** → **MySQL Databases**
2. Buat database baru (misal: `hulusungai_news`)
3. Buat user database dan berikan **All Privileges**
4. Buka **phpMyAdmin** → pilih database yang baru dibuat
5. Klik tab **Import** → upload file `backend/database/schema.sql`
6. Klik **Go** / **Import**

> ✅ Tabel dan kategori default akan otomatis terbuat.

---

### Step 4: Upload ke Hosting

Upload dengan struktur berikut ke `public_html/`:

```
public_html/
├── index.html          ← dari frontend/dist/
├── assets/             ← dari frontend/dist/assets/
├── favicon.svg         ← dari frontend/dist/
├── robots.txt          ← dari frontend/dist/
├── sitemap.xml         ← dari frontend/dist/
├── rss.xml             ← dari frontend/dist/
├── .htaccess           ← dari frontend/dist/ (sudah termasuk security rules)
│
├── api/                ← dari backend/api/
│   ├── index.php
│   └── .htaccess
│
├── config/             ← dari backend/config/
│   ├── database.php
│   └── Logger.php
│
├── database/           ← dari backend/database/
│   └── schema.sql
│
├── scripts/            ← dari backend/scripts/
│   └── create_admin.php
│
├── uploads/            ← dari backend/uploads/
│   └── .htaccess
│
├── .env                ← dari backend/.env (EDIT di server!)
└── logs/               ← buat folder kosong
```

#### Cara Upload via File Manager (cPanel):

1. Buka **cPanel** → **File Manager** → `public_html/`
2. Upload semua file dari `frontend/dist/` ke root `public_html/`
3. Buat folder `api/` → upload `backend/api/*` ke dalamnya
4. Buat folder `config/` → upload `backend/config/*`
5. Buat folder `database/` → upload `backend/database/*`
6. Buat folder `scripts/` → upload `backend/scripts/*`
7. Buat folder `uploads/` → upload `backend/uploads/.htaccess`
8. Buat folder `logs/` (kosong)
9. Upload `backend/.env` ke root `public_html/`

> Atau jika menggunakan `deploy.bat`, cukup upload isi folder `deploy-package/public_html/`.

---

### Step 5: Edit .env di Server

Setelah upload, edit `.env` di server melalui File Manager:

```env
DB_HOST=127.0.0.1
DB_NAME=nama_database_hosting_anda
DB_USER=username_database_hosting
DB_PASS=password_database_hosting
API_SECRET_KEY=abcdef1234567890abcdef1234567890xx
APP_ENV=production
FRONTEND_URL=
```

---

### Step 6: Buat Akun Admin

#### Via SSH:
```bash
cd ~/public_html
php scripts/create_admin.php
```

#### Tanpa SSH (via cPanel Terminal):
1. Buka **cPanel** → **Terminal**
2. Jalankan:
```bash
cd ~/public_html
php scripts/create_admin.php
```

#### Tanpa SSH & Terminal (alternatif):
Buat file `public_html/setup_admin_temp.php`:
```php
<?php
// HAPUS FILE INI SETELAH DIGUNAKAN!
require_once __DIR__ . '/config/database.php';

$email = 'admin@kbb-banjarsadunia.com';
$username = 'admin';
$password = 'GantiPasswordIni123!';
$displayName = 'Administrator';

$db = Database::getInstance()->getConnection();
$hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $db->prepare("INSERT INTO users (username, email, password_hash, display_name, role) VALUES (?, ?, ?, ?, 'admin')");
$stmt->execute([$username, $email, $hash, $displayName]);
echo "Admin berhasil dibuat! Email: $email — SEGERA HAPUS FILE INI!";
```
Buka di browser: `https://kbb-banjarsadunia.com/setup_admin_temp.php`  
**⚠️ WAJIB hapus file ini segera setelah admin dibuat!**

---

### Step 7: Verifikasi Deployment

Cek endpoint-endpoint berikut:

| Test | URL | Expected |
|------|-----|----------|
| Health Check | `https://kbb-banjarsadunia.com/api/health` | JSON dengan `status: ok` |
| Homepage | `https://kbb-banjarsadunia.com` | Halaman utama tampil |
| Categories API | `https://kbb-banjarsadunia.com/api/categories` | JSON list kategori |
| SPA Routing | `https://kbb-banjarsadunia.com/terkini` | Halaman terkini (bukan 404) |
| robots.txt | `https://kbb-banjarsadunia.com/robots.txt` | File robots.txt |

---

## 🔧 Troubleshooting

### Error 500 (Internal Server Error)
- Cek `logs/error.log` di File Manager
- Pastikan `.env` sudah benar
- Pastikan PHP version minimal 7.4 (cek di cPanel → PHP Version)
- Pastikan extension `pdo_mysql` aktif

### API mengembalikan "Server configuration error"
- `.env` belum dibuat atau salah lokasi
- Kredensial database salah
- Database belum diimport

### Halaman selain homepage menampilkan 404
- `.htaccess` tidak ter-upload ke `public_html/`
- `mod_rewrite` belum aktif di hosting
  → Hubungi hosting untuk mengaktifkan

### CORS Error di browser console
- Pastikan `FRONTEND_URL` di `.env` kosong (jika satu domain)
- Atau isi dengan `https://kbb-banjarsadunia.com`

### Gambar upload gagal
- Pastikan folder `uploads/` permission-nya 755 atau 775
- Cek via File Manager → klik kanan `uploads/` → Change Permissions → 755

### Login/Register gagal (CSRF error)
- Pastikan cookie bisa diset (HTTPS aktif)
- Cek browser console untuk error detail
- Pastikan `API_SECRET_KEY` di `.env` sudah diisi (bukan placeholder)

---

## 🔒 Checklist Keamanan Post-Deploy

- [ ] `.env` tidak bisa diakses via browser (`https://domain.com/.env` → 403)
- [ ] `config/` tidak bisa diakses (`https://domain.com/config/database.php` → 403)
- [ ] `database/` tidak bisa diakses (`https://domain.com/database/schema.sql` → 403)
- [ ] `scripts/` tidak bisa diakses (`https://domain.com/scripts/create_admin.php` → 403)
- [ ] HTTPS aktif dan redirect dari HTTP
- [ ] `setup_admin_temp.php` sudah dihapus (jika dibuat)
- [ ] Password admin sudah diganti dari default
- [ ] `API_SECRET_KEY` menggunakan string acak yang kuat

---

## 📞 Kontak

Jika mengalami masalah, periksa `logs/error.log` terlebih dahulu untuk informasi detail error.
