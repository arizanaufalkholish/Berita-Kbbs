<?php
/**
 * HuluSungai News - Database Connection
 * PHP + MySQL Backend Configuration
 */

// Helper to load .env file
function loadEnv($path) {
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

// Load environment variables
loadEnv(__DIR__ . '/../.env');

// Validasi: credentials HARUS di-set via .env (tidak ada fallback default)
$requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS', 'API_SECRET_KEY'];
foreach ($requiredEnvVars as $var) {
    $val = getenv($var);
    if (!$val || ($var === 'API_SECRET_KEY' && strlen($val) < 32) || strpos($val, 'GANTI_') === 0 || strpos($val, 'CHANGE_') === 0) {
        http_response_code(500);
        error_log("[CRITICAL] Missing, weak, or placeholder env variable: $var — pastikan file .env dikonfigurasi dengan benar (bukan nilai default dan API_SECRET_KEY minimal 32 karakter)");
        echo json_encode(['error' => 'Server configuration error: Please setup .env correctly on the server.']);
        exit;
    }
}

define('DB_HOST', getenv('DB_HOST'));
define('DB_NAME', getenv('DB_NAME'));
define('DB_USER', getenv('DB_USER'));
define('DB_PASS', getenv('DB_PASS'));
define('DB_CHARSET', 'utf8mb4');
define('APP_ENV', getenv('APP_ENV') ?: 'production');

class Database {
    private static $instance = null;
    private $pdo;

    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            error_log("[DB_ERROR] Connection failed: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            exit;
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->pdo;
    }
}
