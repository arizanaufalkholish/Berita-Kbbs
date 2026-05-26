#!/bin/bash
# Script Deploy untuk Linux/Mac

echo "=== Memulai Deployment HuluSungai News ==="

# 1. Update kode (opsional, jika menggunakan git)
# git pull origin main

# 2. Build frontend
echo "-> Membangun frontend..."
cd frontend
npm install
npm run build
cd ..

# 3. Setup backend dependencies
echo "-> Menginstall dependensi backend..."
cd backend
composer install --no-dev --optimize-autoloader
cd ..

# 4. Pastikan folder logs ada dan memiliki permission
echo "-> Menyiapkan folder backend..."
mkdir -p backend/logs
mkdir -p backend/uploads/images
chmod -R 775 backend/logs backend/uploads

echo "=== Deployment Selesai! ==="
echo "Pastikan file .env di backend dan frontend sudah disesuaikan."
