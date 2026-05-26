@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ╔══════════════════════════════════════════════╗
echo ║   KBB Sadunia — Deploy Package Builder       ║
echo ╚══════════════════════════════════════════════╝
echo.

set "ROOT=%~dp0"
set "FRONTEND=%ROOT%frontend"
set "BACKEND=%ROOT%backend"
set "DEPLOY=%ROOT%deploy-package"

:: ============================================
:: Step 1: Validasi Prerequisites
:: ============================================
echo [1/7] Memeriksa prerequisites...

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js tidak ditemukan! Install dari https://nodejs.org
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm tidak ditemukan!
    pause
    exit /b 1
)

echo       Node.js: OK
echo       npm: OK
echo.

:: ============================================
:: Step 2: Validasi .env files
:: ============================================
echo [2/7] Memeriksa file .env...

if not exist "%FRONTEND%\.env" (
    echo ERROR: frontend\.env tidak ditemukan!
    echo        Salin .env.example ke .env dan sesuaikan.
    pause
    exit /b 1
)

if not exist "%BACKEND%\.env" (
    echo ERROR: backend\.env tidak ditemukan!
    echo        Salin .env.example ke .env dan sesuaikan.
    pause
    exit /b 1
)

:: Check backend .env for placeholder values
findstr /C:"GANTI_DENGAN" "%BACKEND%\.env" >nul 2>&1
if %errorlevel% equ 0 (
    echo WARNING: backend\.env masih berisi placeholder!
    echo          Buka backend\.env dan ganti semua nilai GANTI_DENGAN_...
    echo.
    echo Lanjutkan build tanpa mengubah .env? (build tetap jalan, tapi deploy akan gagal)
    choice /C YN /M "Lanjutkan?"
    if !errorlevel! equ 2 (
        echo Dibatalkan. Silakan edit backend\.env terlebih dahulu.
        pause
        exit /b 1
    )
)

echo       frontend\.env: OK
echo       backend\.env: OK
echo.

:: ============================================
:: Step 3: Install dependencies
:: ============================================
echo [3/7] Menginstall dependencies frontend...
cd /d "%FRONTEND%"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install gagal!
    pause
    exit /b 1
)
echo       Dependencies: OK
echo.

:: ============================================
:: Step 4: Build frontend
:: ============================================
echo [4/7] Mem-build frontend (npm run build)...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build gagal!
    pause
    exit /b 1
)
echo       Build: OK
echo.

:: ============================================
:: Step 5: Buat deploy package
:: ============================================
echo [5/7] Membuat deploy package...

:: Hapus deploy-package lama
if exist "%DEPLOY%" rd /s /q "%DEPLOY%"
mkdir "%DEPLOY%\public_html"

:: Copy frontend dist ke public_html
xcopy "%FRONTEND%\dist\*" "%DEPLOY%\public_html\" /E /I /Q /Y >nul

:: Copy backend api
mkdir "%DEPLOY%\public_html\api"
xcopy "%BACKEND%\api\*" "%DEPLOY%\public_html\api\" /E /I /Q /Y >nul

:: Copy backend config
mkdir "%DEPLOY%\public_html\config"
xcopy "%BACKEND%\config\*" "%DEPLOY%\public_html\config\" /E /I /Q /Y >nul

:: Copy backend database
mkdir "%DEPLOY%\public_html\database"
xcopy "%BACKEND%\database\*" "%DEPLOY%\public_html\database\" /E /I /Q /Y >nul

:: Copy backend scripts
mkdir "%DEPLOY%\public_html\scripts"
xcopy "%BACKEND%\scripts\*" "%DEPLOY%\public_html\scripts\" /E /I /Q /Y >nul

:: Copy uploads folder with .htaccess
mkdir "%DEPLOY%\public_html\uploads"
if exist "%BACKEND%\uploads\.htaccess" (
    copy "%BACKEND%\uploads\.htaccess" "%DEPLOY%\public_html\uploads\" >nul
)

:: Copy backend .htaccess (security for config/database/scripts)
copy "%BACKEND%\.htaccess" "%DEPLOY%\public_html\.htaccess.backend" >nul

:: Copy backend .env
copy "%BACKEND%\.env" "%DEPLOY%\public_html\.env" >nul

:: Buat folder logs
mkdir "%DEPLOY%\public_html\logs"

echo       Deploy package: OK
echo.

:: ============================================
:: Step 6: Merge .htaccess
:: ============================================
echo [6/7] Mengkonfigurasi .htaccess...

:: Frontend's .htaccess sudah termasuk semua rules yang diperlukan
:: (termasuk proteksi config/database/scripts/logs)
:: Jadi kita hanya perlu yang dari dist/
echo       .htaccess: OK
echo.

:: ============================================
:: Step 7: Summary
:: ============================================
echo [7/7] Selesai!
echo.
echo ╔══════════════════════════════════════════════╗
echo ║   Deploy Package Siap!                       ║
echo ╚══════════════════════════════════════════════╝
echo.
echo Lokasi: %DEPLOY%\public_html\
echo.
echo Struktur:
echo   public_html\
echo   ├── index.html          (Frontend)
echo   ├── assets\             (CSS, JS, images)
echo   ├── .htaccess           (SPA routing + security)
echo   ├── .env                (Backend config — EDIT DI SERVER!)
echo   ├── api\                (PHP REST API)
echo   │   ├── index.php
echo   │   └── .htaccess
echo   ├── config\             (PHP config — dilindungi .htaccess)
echo   ├── database\           (SQL schema — dilindungi .htaccess)
echo   ├── scripts\            (Admin scripts — dilindungi .htaccess)
echo   ├── uploads\            (Upload gambar)
echo   └── logs\               (Log files)
echo.
echo ═══════════════════════════════════════════════
echo LANGKAH SELANJUTNYA:
echo ═══════════════════════════════════════════════
echo 1. Upload SEMUA isi folder public_html\ ke public_html di hosting
echo 2. Edit .env di server (sesuaikan DB credentials)
echo 3. Import database\schema.sql via phpMyAdmin
echo 4. Jalankan: php scripts\create_admin.php (via SSH)
echo 5. Test: https://kbb-banjarsadunia.com/api/health
echo 6. Buka: https://kbb-banjarsadunia.com
echo.
echo Lihat DEPLOY.md untuk panduan lengkap.
echo.
pause
