# HuluSungai News — Portal Berita & Artikel

Portal berita dan artikel terlengkap seputar Hulu Sungai, Kalimantan Selatan.

## 🏗️ Arsitektur

Website ini menggunakan arsitektur **Headless CMS**:

```
┌─────────────────┐     REST API     ┌──────────────────────┐
│  React Frontend │ ◄──────────────► │  PHP Custom API      │
│  + TailwindCSS  │                  │  + MySQL Database    │
│  (Node.js)      │                  │                      │
└─────────────────┘                  └──────────────────────┘
```

## 🛠️ Teknologi

| Layer     | Teknologi            | Fungsi                              |
|-----------|----------------------|-------------------------------------|
| Frontend  | React + Vite         | UI komponen interaktif              |
| Styling   | TailwindCSS v4       | Utility-first CSS framework         |
| Runtime   | Node.js              | Build tools & dev server            |
| Backend   | PHP                  | REST API & server logic             |
| Database  | MySQL                | Penyimpanan data relasional         |

## 📁 Struktur Proyek

```
Artikel Hulusungai/
├── frontend/                  # React + TailwindCSS Frontend
│   ├── src/
│   │   ├── components/        # Komponen UI (Navbar, Footer, ArticleCard)
│   │   ├── pages/             # Halaman (Home, Articles, Detail, Categories, About)
│   │   ├── data/              # Mock data artikel (simulasi WordPress API)
│   │   ├── App.jsx            # Router utama
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Design system TailwindCSS
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── backend/                   # PHP + MySQL Backend
    ├── api/
    │   └── index.php          # REST API endpoints
    ├── config/
    │   └── database.php       # Koneksi MySQL (PDO)
    ├── database/
    │   └── schema.sql         # Schema database MySQL
```

## 🔒 Keamanan & Konfigurasi

Proyek ini telah melalui audit keamanan. Sebelum menjalankan, pastikan untuk mengatur kredensial melalui environment variables:

1. Copy file `backend/.env.example` menjadi `backend/.env`
2. Atur password database dan `API_SECRET_KEY` dengan string yang kuat.
3. Jangan pernah commit file `.env` ke repository.

Fitur keamanan yang terimplementasi:
- Prepared Statements (anti SQL-injection)
- CSRF protection via Origin/Referer token check
- Security Headers (CSP, X-Frame-Options, X-Content-Type-Options)
- XSS prevention (DOMPurify & React Auto-escaping)
- Rate limiting pada API endpoint kritis (komentar, login, newsletter)
- Password strength validation di client

## 🚀 Cara Menjalankan

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
# Buka http://localhost:5173
```

### Backend (PHP + MySQL)
1. Install XAMPP / WAMP / Laragon
2. Import `backend/database/schema.sql` ke MySQL
3. Copy `backend/.env.example` ke `backend/.env` dan sesuaikan kredensialnya.
4. Jalankan PHP built-in server:
```bash
cd backend
php -S localhost:8000 -t api
```



## 📱 Fitur

- ✅ Halaman beranda dengan artikel unggulan & trending
- ✅ Daftar artikel dengan filter kategori
- ✅ Halaman detail artikel lengkap
- ✅ Kategori dengan preview artikel
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Glassmorphism & animasi modern
- ✅ Search bar
- ✅ Newsletter subscription
- ✅ SEO optimized
- ✅ REST API backend (PHP)
- ✅ Database schema (MySQL)
