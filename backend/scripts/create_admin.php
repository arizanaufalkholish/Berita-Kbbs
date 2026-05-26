<?php
/**
 * Script untuk membuat user admin pertama kali dengan aman.
 * Jalankan via CLI: php create_admin.php
 * 
 * Compatible dengan Windows, Linux, dan Mac.
 */

require_once __DIR__ . '/../config/database.php';

if (php_sapi_name() !== 'cli') {
    die("Script ini harus dijalankan dari command line.\n");
}

echo "====================================\n";
echo "  KBB Sadunia - Admin Setup\n";
echo "====================================\n\n";

// Cross-platform input helpers
function promptInput($prompt) {
    echo $prompt;
    if (function_exists('readline')) {
        return readline('');
    }
    return trim(fgets(STDIN));
}

function promptPassword($prompt) {
    echo $prompt;
    
    // Try Windows method first
    if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
        // On Windows, just read normally (no easy way to hide input)
        return trim(fgets(STDIN));
    }
    
    // Linux/Mac: hide password input
    if (function_exists('shell_exec')) {
        $command = '/bin/bash -c "read -s password && echo \$password"';
        $password = shell_exec($command);
        echo "\n";
        if ($password !== null) {
            return trim($password);
        }
    }
    
    // Fallback: read normally
    return trim(fgets(STDIN));
}

$email = promptInput("Masukkan email admin: ");
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die("Error: Format email tidak valid.\n");
}

$username = promptInput("Masukkan username admin: ");
if (empty(trim($username))) {
    die("Error: Username tidak boleh kosong.\n");
}

$password = promptPassword("Masukkan password (minimal 8 karakter): ");

if (strlen($password) < 8) {
    die("Error: Password terlalu pendek (minimal 8 karakter).\n");
}

$displayName = promptInput("Masukkan nama tampilan (Display Name) [default: Administrator]: ");
if (empty(trim($displayName))) {
    $displayName = 'Administrator';
}

try {
    $db = Database::getInstance()->getConnection();
    
    // Check jika email/username sudah ada
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
    $stmt->execute([$email, $username]);
    if ($stmt->fetch()) {
        die("Error: Email atau username sudah terdaftar.\n");
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $db->prepare(
        "INSERT INTO users (username, email, password_hash, display_name, role) 
         VALUES (?, ?, ?, ?, 'admin')"
    );
    
    $stmt->execute([$username, $email, $hash, $displayName]);
    
    echo "\n====================================\n";
    echo "  Sukses! User admin berhasil dibuat.\n";
    echo "====================================\n";
    echo "Email    : $email\n";
    echo "Username : $username\n";
    echo "Role     : admin\n";
    echo "\nAnda sekarang bisa login di website.\n";
    
} catch (PDOException $e) {
    echo "\nDatabase Error: " . $e->getMessage() . "\n";
    echo "Pastikan database sudah diimport dan .env sudah dikonfigurasi.\n";
}
