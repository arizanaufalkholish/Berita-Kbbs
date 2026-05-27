<?php
/**
 * HuluSungai News - REST API
 * Endpoints untuk artikel, kategori, dan komentar
 * Compatible dengan WordPress REST API format
 * 
 * SECURITY: Includes CSRF protection, rate limiting, security headers, and logging
 */

// ============================================
// Production Error Handling
// ============================================
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// ============================================
// Security Headers (OWASP Best Practice)
// ============================================
header_remove('X-Powered-By');
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: camera=(), microphone=(), geolocation=()');

// --------------------------------------------
// Load environment variables early
// --------------------------------------------
// We need access to API_SECRET_KEY and other env vars before we include
// the database config. The database config file is responsible for
// loading the .env file and validating required variables, but when
// generating a CSRF token for GET requests (see below) we reference
// API_SECRET_KEY before that file is required. This caused an issue
// when deploying because the .env values were never loaded and the
// secret fell back to an empty string. To avoid that, we load the
// .env file manually here if it exists. This does not instantiate a
// database connection, it only populates getenv/$_ENV/$_SERVER.
$envPath = __DIR__ . '/../.env';
if (file_exists($envPath)) {
    $linesEnv = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($linesEnv as $lineEnv) {
        if (strpos(trim($lineEnv), '#') === 0) continue;
        if (strpos($lineEnv, '=') === false) continue;
        list($nameEnv, $valueEnv) = explode('=', $lineEnv, 2);
        $nameEnv = trim($nameEnv);
        $valueEnv = trim($valueEnv);
        if (!array_key_exists($nameEnv, $_SERVER) && !array_key_exists($nameEnv, $_ENV)) {
            putenv(sprintf('%s=%s', $nameEnv, $valueEnv));
            $_ENV[$nameEnv] = $valueEnv;
            $_SERVER[$nameEnv] = $valueEnv;
        }
    }
}

// CORS - restricted to frontend URL from env
$frontend_url = getenv('FRONTEND_URL');
if (!$frontend_url) {
    $scheme = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    // Fallback dinamis ke domain saat ini (misal di shared hosting frontend & backend 1 domain)
    $frontend_url = $scheme . '://' . $host;
    
    // Khusus environment lokal untuk development fallback
    if (strpos($host, 'localhost') !== false || strpos($host, '127.0.0.1') !== false) {
        $frontend_url = 'http://localhost:5173';
    }
}
header("Access-Control-Allow-Origin: $frontend_url");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (empty($_COOKIE['csrf_token'])) {
        $token = bin2hex(random_bytes(32));
        $secret = getenv('API_SECRET_KEY');
        $hmac = hash_hmac('sha256', $token, $secret);
        $signed_token = $token . '|' . $hmac;
        
        setcookie('csrf_token', $signed_token, [
            'expires' => time() + 86400,
            'path' => '/',
            'secure' => (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on'),
            'httponly' => false,
            'samesite' => 'Lax'
        ]);
        $_COOKIE['csrf_token'] = $signed_token;
    }
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/Logger.php';

// ============================================
// Security Helpers
// ============================================

/**
 * Validate JSON Content-Type
 */
function requireJsonContentType() {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (strpos($contentType, 'application/json') === false) {
        http_response_code(415);
        echo json_encode(['error' => 'Content-Type must be application/json']);
        exit;
    }
}

/**
 * Helper to get JSON body
 */
function getJsonBody() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

/**
 * Simple file-based rate limiter
 * Membatasi request per IP per endpoint
 */
function checkRateLimit($endpoint, $maxRequests = 10, $windowSeconds = 60) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $key = md5($ip . $endpoint);
    $rateLimitDir = sys_get_temp_dir() . '/hs_ratelimit';
    
    if (!is_dir($rateLimitDir)) {
        @mkdir($rateLimitDir, 0700, true);
    }
    
    $file = "$rateLimitDir/$key.json";
    $now = time();
    $data = ['requests' => [], 'blocked_until' => 0];
    
    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true) ?: $data;
    }
    
    // Cek apakah masih diblokir
    if ($data['blocked_until'] > $now) {
        $retryAfter = $data['blocked_until'] - $now;
        header("Retry-After: $retryAfter");
        http_response_code(429);
        logSecurity('RATE_LIMIT', "Blocked: $ip on $endpoint (retry after {$retryAfter}s)");
        echo json_encode(['error' => 'Too many requests. Please try again later.', 'retry_after' => $retryAfter]);
        exit;
    }
    
    // Hapus request lama di luar window
    $data['requests'] = array_filter($data['requests'], fn($t) => $t > ($now - $windowSeconds));
    
    // Cek limit
    if (count($data['requests']) >= $maxRequests) {
        $data['blocked_until'] = $now + $windowSeconds;
        file_put_contents($file, json_encode($data));
        header("Retry-After: $windowSeconds");
        http_response_code(429);
        logSecurity('RATE_LIMIT', "Rate limit exceeded: $ip on $endpoint ({$maxRequests}/{$windowSeconds}s)");
        echo json_encode(['error' => 'Too many requests. Please try again later.', 'retry_after' => $windowSeconds]);
        exit;
    }
    
    // Tambah request
    $data['requests'][] = $now;
    file_put_contents($file, json_encode($data));
}

/**
 * Validasi CSRF token untuk POST/PUT/DELETE requests
 * Token dikirim via header X-CSRF-Token
 */
function validateCSRFToken() {
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Hanya cek untuk state-changing methods
    if (!in_array($method, ['POST', 'PUT', 'DELETE'])) {
        return true;
    }

    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $excluded_endpoints = [
        '/api/login',
        '/api/register',
        '/api/forgot-password',
        '/api/reset-password',
        '/api/upload'
    ];
    if (in_array($uri, $excluded_endpoints)) {
        return true;
    }

    
    // 1. Cek Origin/Referer header sebagai first layer defense
    global $frontend_url; // Use global frontend_url calculated at the top
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    
    $allowedOrigin = parse_url($frontend_url, PHP_URL_HOST);
    
    if ($origin) {
        $requestOrigin = parse_url($origin, PHP_URL_HOST);
        if ($requestOrigin !== $allowedOrigin) {
            logSecurity('CSRF_FAIL', "Origin mismatch: expected=$allowedOrigin got=$requestOrigin");
            http_response_code(403);
            echo json_encode(['error' => 'CSRF validation failed: Origin mismatch']);
            exit;
        }
    } elseif ($referer) {
        $refererHost = parse_url($referer, PHP_URL_HOST);
        if ($refererHost !== $allowedOrigin) {
            logSecurity('CSRF_FAIL', "Referer mismatch: expected=$allowedOrigin got=$refererHost");
            http_response_code(403);
            echo json_encode(['error' => 'CSRF validation failed: Referer mismatch']);
            exit;
        }
    }
    
    // 2. Double-Submit Cookie Check
    $cookieToken = $_COOKIE['csrf_token'] ?? '';
    $headerToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    
    if (empty($cookieToken) || empty($headerToken) || !hash_equals($cookieToken, $headerToken)) {
        logSecurity('CSRF_FAIL', "Token mismatch or missing");
        http_response_code(403);
        echo json_encode(['error' => 'CSRF validation failed: Invalid or missing CSRF token']);
        exit;
    }
    
    // 3. Verify HMAC Signature
    $parts = explode('|', $cookieToken);
    if (count($parts) !== 2) {
        logSecurity('CSRF_FAIL', "Invalid token format");
        http_response_code(403);
        echo json_encode(['error' => 'CSRF validation failed: Invalid token format']);
        exit;
    }
    
    list($tokenValue, $hmac) = $parts;
    $secret = getenv('API_SECRET_KEY');
    $expectedHmac = hash_hmac('sha256', $tokenValue, $secret);
    
    if (!hash_equals($expectedHmac, $hmac)) {
        logSecurity('CSRF_FAIL', "Invalid HMAC signature");
        http_response_code(403);
        echo json_encode(['error' => 'CSRF validation failed: Token signature invalid']);
        exit;
    }
    
    return true;
}

/**
 * Security logging — catat event keamanan ke file log
 */
function logSecurity($type, $message) {
    Logger::getInstance()->security($type, $message);
}

/**
 * Log API request (non-security, untuk monitoring)
 */
function logRequest($handler) {
    Logger::getInstance()->info("API Request routed to $handler");
}

// ============================================
// JWT Auth Helpers
// ============================================

function generateToken($user) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'user_id' => $user['id'],
        'role' => $user['role'],
        'exp' => time() + 86400 // 1 day
    ]);
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, getenv('API_SECRET_KEY'), true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verifyToken($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    $signature = hash_hmac('sha256', $parts[0] . "." . $parts[1], getenv('API_SECRET_KEY'), true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    if (hash_equals($base64UrlSignature, $parts[2])) {
        // Cek blacklist
        $tokenHash = hash('sha256', $token);
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT 1 FROM token_blacklist WHERE token_hash = ? AND expires_at > NOW()");
        $stmt->execute([$tokenHash]);
        if ($stmt->fetchColumn()) {
            return false;
        }

        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
        if ($payload && $payload['exp'] > time()) {
            return $payload;
        }
    }
    return false;
}

function getAuthHeader() {
    if (!empty($_COOKIE['token'])) {
        return 'Bearer ' . $_COOKIE['token'];
    }
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (function_exists('getallheaders')) {
        $headers = getallheaders();
        return $headers['Authorization'] ?? '';
    }
    return '';
}

// ============================================
// Apply CSRF protection untuk semua POST/PUT/DELETE
// ============================================
validateCSRFToken();

// ============================================
// Router
// ============================================
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Simple Router
$routes = [
    'GET' => [
        '/api/health' => 'healthCheck',
        '/api/articles' => 'getArticles',
        '/api/articles/(\d+)' => 'getArticle',
        '/api/articles/slug/(.+)' => 'getArticleBySlug',
        '/api/categories' => 'getCategories',
        '/api/trending' => 'getTrending',
        '/api/sitemap' => 'getSitemap',
        '/api/sitemap\.xml' => 'getSitemapXml',
        '/api/rss\.xml' => 'getRssXml',
        '/api/me' => 'getCurrentUser',
        '/api/comments' => 'getComments',
    ],
    'POST' => [
        '/api/articles' => 'createArticle',
        '/api/comments' => 'createComment',
        '/api/newsletter' => 'subscribe',
        '/api/login' => 'loginUser',
        '/api/logout' => 'logoutUser',
        '/api/register' => 'registerUser',
        '/api/upload' => 'uploadImage',
        '/api/forgot-password' => 'forgotPassword',
        '/api/reset-password' => 'resetPassword',
    ],
    'PUT' => [
        '/api/articles/(\d+)' => 'updateArticle',
        '/api/comments/(\d+)' => 'updateCommentStatus',
    ],
    'DELETE' => [
        '/api/articles/(\d+)' => 'deleteArticle',
        '/api/comments/(\d+)' => 'deleteComment',
    ],
];

// Match route
$handler = null;
$params = [];

if (isset($routes[$method])) {
    foreach ($routes[$method] as $pattern => $fn) {
        $regex = '#^' . $pattern . '$#';
        if (preg_match($regex, $uri, $matches)) {
            $handler = $fn;
            $params = array_slice($matches, 1);
            break;
        }
    }
}

if ($handler && function_exists($handler)) {
    logRequest($handler);
    call_user_func_array($handler, $params);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
}

// ============================================
// API Handlers
// ============================================

/**
 * Health Check — verifikasi backend & database berjalan.
 * GET /api/health
 */
function healthCheck() {
    $status = ['status' => 'ok', 'timestamp' => date('c')];
    
    try {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->query('SELECT 1');
        if (getenv('APP_ENV') !== 'production') {
            $status['database'] = 'connected';
            $stmt = $db->query("SHOW TABLES LIKE 'articles'");
            $status['tables'] = $stmt->rowCount() > 0 ? 'ready' : 'not_imported';
        }
    } catch (Exception $e) {
        $status['status'] = 'degraded';
        if (getenv('APP_ENV') !== 'production') {
            $status['database'] = 'error';
            $status['db_error'] = $e->getMessage();
        }
    }
    
    echo json_encode($status, JSON_PRETTY_PRINT);
}

function getArticles() {
    $db = Database::getInstance()->getConnection();
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $perPage = isset($_GET['per_page']) ? min(100, max(1, (int)$_GET['per_page'])) : 10;
    $category = $_GET['category'] ?? null;
    $search = $_GET['search'] ?? null;
    $statusFilter = $_GET['status'] ?? 'published';
    $offset = ($page - 1) * $perPage;

    // Check auth for getting non-published articles
    $isAdminOrAuthor = false;
    $userId = null;
    $role = null;
    
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') === 0) {
        $token = substr($authHeader, 7);
        $payload = verifyToken($token);
        if ($payload) {
            $userId = $payload['user_id'];
            $role = $payload['role'];
            if (in_array($role, ['admin', 'editor', 'author'])) {
                $isAdminOrAuthor = true;
            }
        }
    }
    
    if ($statusFilter !== 'published' && !$isAdminOrAuthor) {
        $statusFilter = 'published';
    }
    
    $bindParams = [];
    if ($statusFilter === 'all') {
        if ($role === 'admin' || $role === 'editor') {
            $where = "WHERE 1=1";
        } else if ($role === 'author') {
            $where = "WHERE a.status = 'published' OR a.author_id = :current_user_id";
            $bindParams[':current_user_id'] = $userId;
        } else {
            $where = "WHERE a.status = 'published'";
        }
    } else {
        $where = "WHERE a.status = :status";
        $bindParams[':status'] = $statusFilter;
    }

    if ($category) {
        $where .= " AND c.slug = :category";
        $bindParams[':category'] = $category;
    }

    if ($search) {
        $where .= " AND (a.title LIKE :search OR a.excerpt LIKE :search OR a.content LIKE :search)";
        $bindParams[':search'] = '%' . $search . '%';
    }

    $sql = "SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
                   u.display_name as author_name
            FROM articles a
            LEFT JOIN categories c ON a.category_id = c.id
            LEFT JOIN users u ON a.author_id = u.id
            $where
            ORDER BY a.published_at DESC
            LIMIT :limit OFFSET :offset";

    $stmt = $db->prepare($sql);
    foreach ($bindParams as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $articles = $stmt->fetchAll();

    // Get total count
    $countSql = "SELECT COUNT(*) FROM articles a LEFT JOIN categories c ON a.category_id = c.id $where";
    $countStmt = $db->prepare($countSql);
    foreach ($bindParams as $key => $val) {
        $countStmt->bindValue($key, $val);
    }
    $countStmt->execute();
    $total = $countStmt->fetchColumn();

    echo json_encode([
        'data' => $articles,
        'meta' => [
            'total' => (int)$total,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => ceil($total / $perPage),
        ],
    ]);
}

function getArticle($id) {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("UPDATE articles SET views = views + 1 WHERE id = :id AND status = 'published'");
    $stmt->execute([':id' => $id]);

    $stmt = $db->prepare(
        "SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
                u.display_name as author_name
         FROM articles a
         LEFT JOIN categories c ON a.category_id = c.id
         LEFT JOIN users u ON a.author_id = u.id
         WHERE a.id = :id"
    );
    $stmt->execute([':id' => $id]);
    $article = $stmt->fetch();

    if (!$article) {
        http_response_code(404);
        echo json_encode(['error' => 'Article not found']);
        return;
    }

    if ($article['status'] !== 'published') {
        $authHeader = getAuthHeader();
        $isAuthorized = false;
        if (strpos($authHeader, 'Bearer ') === 0) {
            $token = substr($authHeader, 7);
            $payload = verifyToken($token);
            if ($payload) {
                if (in_array($payload['role'], ['admin', 'editor']) || $payload['user_id'] == $article['author_id']) {
                    $isAuthorized = true;
                }
            }
        }
        if (!$isAuthorized) {
            http_response_code(404); // Return 404 to hide existence of draft
            echo json_encode(['error' => 'Article not found']);
            return;
        }
    }

    // Get tags
    $tagStmt = $db->prepare(
        "SELECT t.name FROM tags t JOIN article_tags at2 ON t.id = at2.tag_id WHERE at2.article_id = :id"
    );
    $tagStmt->execute([':id' => $id]);
    $article['tags'] = $tagStmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode(['data' => $article]);
}

function getArticleBySlug($slug) {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare(
        "SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
                u.display_name as author_name
         FROM articles a
         LEFT JOIN categories c ON a.category_id = c.id
         LEFT JOIN users u ON a.author_id = u.id
         WHERE a.slug = :slug"
    );
    $stmt->execute([':slug' => $slug]);
    $article = $stmt->fetch();

    if ($article && $article['status'] === 'published') {
        $updateStmt = $db->prepare("UPDATE articles SET views = views + 1 WHERE id = :id");
        $updateStmt->execute([':id' => $article['id']]);
    }

    if (!$article) {
        http_response_code(404);
        echo json_encode(['error' => 'Article not found']);
        return;
    }

    if ($article['status'] !== 'published') {
        $authHeader = getAuthHeader();
        $isAuthorized = false;
        if (strpos($authHeader, 'Bearer ') === 0) {
            $token = substr($authHeader, 7);
            $payload = verifyToken($token);
            if ($payload) {
                if (in_array($payload['role'], ['admin', 'editor']) || $payload['user_id'] == $article['author_id']) {
                    $isAuthorized = true;
                }
            }
        }
        if (!$isAuthorized) {
            http_response_code(404); // Return 404 to hide existence of draft
            echo json_encode(['error' => 'Article not found']);
            return;
        }
    }

    echo json_encode(['data' => $article]);
}

function getCategories() {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query(
        "SELECT c.*, COUNT(a.id) as article_count
         FROM categories c
         LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
         GROUP BY c.id
         ORDER BY c.name"
    );
    echo json_encode(['data' => $stmt->fetchAll()]);
}

function getTrending() {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query(
        "SELECT a.id, a.title, a.slug, a.views, a.image_url, c.name as category_name
         FROM articles a
         LEFT JOIN categories c ON a.category_id = c.id
         WHERE a.status = 'published'
         ORDER BY a.views DESC
         LIMIT 5"
    );
    echo json_encode(['data' => $stmt->fetchAll()]);
}

function getSitemap() {
    $db = Database::getInstance()->getConnection();
    
    // Get all published articles slugs and updated times
    $stmt = $db->query(
        "SELECT slug, updated_at 
         FROM articles 
         WHERE status = 'published' 
         ORDER BY updated_at DESC"
    );
    $articles = $stmt->fetchAll();

    // Get all categories slugs
    $stmt2 = $db->query(
        "SELECT slug 
         FROM categories"
    );
    $categories = $stmt2->fetchAll();

    echo json_encode([
        'data' => [
            'articles' => $articles,
            'categories' => $categories
        ]
    ]);
}

function loginUser() {
    requireJsonContentType();
    // Basic rate limit
    checkRateLimit('loginUser', 10, 60);

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || empty($data['email']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password required']);
        return;
    }

    $email = $data['email'];
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $db = Database::getInstance()->getConnection();

    // 1. Check Brute Force Lockout
    // Hitung kegagalan 15 menit terakhir
    $stmt = $db->prepare("SELECT COUNT(*) FROM login_attempts WHERE email = :email AND success = FALSE AND attempted_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)");
    $stmt->execute([':email' => $email]);
    $recentFails = $stmt->fetchColumn();

    if ($recentFails >= 5) {
        logSecurity('BRUTE_FORCE_LOCKOUT', "Account locked for 15 mins due to 5+ failed attempts: $email");
        http_response_code(429);
        header("Retry-After: 900"); // 15 mins
        echo json_encode(['error' => 'Account temporarily locked due to multiple failed login attempts. Please try again after 15 minutes.']);
        return;
    }

    // 2. Process Login
    $stmt = $db->prepare("SELECT id, password_hash, role, display_name FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($data['password'], $user['password_hash'])) {
        // Success
        $stmt = $db->prepare("INSERT INTO login_attempts (email, ip_address, success) VALUES (:email, :ip, TRUE)");
        $stmt->execute([':email' => $email, ':ip' => $ip]);

        $token = generateToken($user);
        
        setcookie('token', $token, [
            'expires' => time() + 86400,
            'path' => '/',
            'secure' => (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on'),
            'httponly' => true,
            'samesite' => 'Strict'
        ]);
        
        logSecurity('LOGIN_SUCCESS', "User logged in: $email");
        echo json_encode(['user' => ['id' => $user['id'], 'name' => $user['display_name'], 'role' => $user['role']]]);
    } else {
        // Failed
        $stmt = $db->prepare("INSERT INTO login_attempts (email, ip_address, success) VALUES (:email, :ip, FALSE)");
        $stmt->execute([':email' => $email, ':ip' => $ip]);

        logSecurity('LOGIN_FAIL', "Failed login attempt: $email. Fails in last 15m: " . ($recentFails + 1));
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
}

function forgotPassword() {
    requireJsonContentType();
    // Rate limit: max 3 per menit untuk mencegah spam
    checkRateLimit('forgotPassword', 3, 60); 
    
    $data = getJsonBody();
    if (empty($data['email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email is required']);
        return;
    }
    
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        return;
    }
    
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT id, display_name FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();
    
    if ($user) {
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', time() + 3600); // 1 jam
        
        // Buat tabel password_resets jika belum ada (opsional, diletakkan di init db idealnya)
        try {
            $db->exec("CREATE TABLE IF NOT EXISTS password_resets (
                email VARCHAR(255) PRIMARY KEY,
                token VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )");
            
            $stmt = $db->prepare("INSERT INTO password_resets (email, token, created_at) VALUES (:email, :token, NOW()) ON DUPLICATE KEY UPDATE token = :token, created_at = NOW()");
            $stmt->execute([':email' => $email, ':token' => $token]);
            
            global $frontend_url;
            $resetLink = rtrim($frontend_url, '/') . '/auth/reset-password?token=' . $token . '&email=' . urlencode($email);
            
            $to = $email;
            $subject = "Reset Password - KBB Sadunia";
            $message = "Halo " . $user['display_name'] . ",\n\n";
            $message .= "Seseorang telah meminta untuk mereset kata sandi akun Anda.\n";
            $message .= "Jika ini adalah Anda, silakan klik tautan berikut untuk mereset kata sandi:\n\n";
            $message .= $resetLink . "\n\n";
            $message .= "Tautan ini akan kedaluwarsa dalam 1 jam.\n";
            $message .= "Jika Anda tidak meminta reset kata sandi, abaikan email ini.\n\n";
            $message .= "Salam,\nTim KBB Sadunia";
            
            $headers = "From: noreply@hulusungai.news\r\n";
            $headers .= "Reply-To: support@hulusungai.news\r\n";
            $headers .= "X-Mailer: PHP/" . phpversion();
            
            @mail($to, $subject, $message, $headers);
            logSecurity('FORGOT_PASSWORD', "Reset link sent to: $email");
            
        } catch (Exception $e) {
            error_log("Reset password error: " . $e->getMessage());
        }
    }
    
    // Always return success to prevent email enumeration
    echo json_encode(['message' => 'Jika email Anda terdaftar, link reset password telah dikirimkan.']);
}

function logoutUser() {
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') === 0) {
        $token = substr($authHeader, 7);
        $tokenHash = hash('sha256', $token);
        
        $parts = explode('.', $token);
        if (count($parts) === 3) {
            $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
            $exp = $payload['exp'] ?? time() + 86400;
            
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare("INSERT INTO token_blacklist (token_hash, expires_at) VALUES (?, FROM_UNIXTIME(?))");
            $stmt->execute([$tokenHash, $exp]);
            
            if (rand(1, 10) === 1) {
                $db->query("DELETE FROM token_blacklist WHERE expires_at < NOW()");
            }
        }
    }
    
    // Clear the token cookie
    setcookie('token', '', [
        'expires' => time() - 3600,
        'path' => '/',
        'secure' => (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on'),
        'httponly' => true,
        'samesite' => 'Strict'
    ]);
    
    echo json_encode(['message' => 'Logged out successfully']);
}

function registerUser() {
    requireJsonContentType();
    checkRateLimit('registerUser', 5, 3600); // 5 per hour
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || empty($data['email']) || empty($data['password']) || empty($data['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields required']);
        return;
    }
    $db = Database::getInstance()->getConnection();
    
    // Check if email exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute([':email' => $data['email']]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Email already registered']);
        return;
    }

    $hash = password_hash($data['password'], PASSWORD_BCRYPT);
    $username = explode('@', $data['email'])[0] . rand(100, 999);
    
    $stmt = $db->prepare("INSERT INTO users (username, email, password_hash, display_name, role) VALUES (:u, :e, :p, :n, 'subscriber')");
    $stmt->execute([
        ':u' => $username,
        ':e' => $data['email'],
        ':p' => $hash,
        ':n' => strip_tags($data['name'])
    ]);
    
    logSecurity('REGISTER_SUCCESS', "New user registered: {$data['email']}");
    echo json_encode(['message' => 'Registration successful']);
}

function generateUniqueSlug($db, $baseSlug) {
    $slug = $baseSlug;
    $counter = 1;
    while (true) {
        $stmt = $db->prepare("SELECT id FROM articles WHERE slug = ?");
        $stmt->execute([$slug]);
        if (!$stmt->fetch()) {
            break;
        }
        $slug = $baseSlug . '-' . $counter;
        $counter++;
    }
    return $slug;
}

function createArticle() {
    requireJsonContentType();
    // Authentication & RBAC Check
    $authHeader = getAuthHeader();
    
    if (strpos($authHeader, 'Bearer ') !== 0) {
        logSecurity('AUTH_FAIL', "Unauthorized attempt to create article. Missing/invalid header.");
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }

    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    
    if (!$payload) {
        logSecurity('AUTH_FAIL', "Invalid token on createArticle");
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        return;
    }

    if (!in_array($payload['role'], ['admin', 'author', 'editor'])) {
        logSecurity('RBAC_FAIL', "User ID {$payload['user_id']} attempted to create article without permission");
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: insufficient permissions']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['title'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Title is required']);
        return;
    }

    $db = Database::getInstance()->getConnection();
    $clean_title = strip_tags($data['title']);
    $baseSlug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $clean_title));
    $baseSlug = trim($baseSlug, '-') ?: 'artikel';
    $slug = generateUniqueSlug($db, $baseSlug);

    // Server-side XSS sanitation
    $clean_title = strip_tags($data['title']);
    $clean_excerpt = strip_tags($data['excerpt'] ?? '');
    
    // Gunakan HTMLPurifier jika tersedia via Composer, jika tidak fallback
    $autoloadPath = __DIR__ . '/../vendor/autoload.php';
    if (file_exists($autoloadPath)) {
        require_once $autoloadPath;
        $config = HTMLPurifier_Config::createDefault();
        $purifier = new HTMLPurifier($config);
        $clean_content = $purifier->purify($data['content'] ?? '');
    } else {
        $allowed_tags = '<p><br><strong><em><ul><li><ol><h1><h2><h3><h4><h5><h6><blockquote><a><img>';
        $clean_content = strip_tags($data['content'] ?? '', $allowed_tags);
    }

    $stmt = $db->prepare(
        "INSERT INTO articles (title, slug, excerpt, content, image_url, category_id, author_id, status, featured, read_time, published_at)
         VALUES (:title, :slug, :excerpt, :content, :image, :cat, :author, :status, :featured, :read_time, NOW())"
    );
    $stmt->execute([
        ':title' => $clean_title,
        ':slug' => $slug,
        ':excerpt' => $clean_excerpt,
        ':content' => $clean_content,
        ':image' => filter_var($data['image_url'] ?? '', FILTER_SANITIZE_URL),
        ':cat' => $data['category_id'] ?? null,
        ':author' => $payload['user_id'], // Force author_id from token, NOT from request
        ':status' => in_array($data['status'] ?? '', ['draft', 'published', 'archived']) ? $data['status'] : 'draft',
        ':featured' => ($payload['role'] === 'admin') ? ($data['featured'] ?? false) : false, // Only admin can feature
        ':read_time' => strip_tags($data['read_time'] ?? '5 menit'),
    ]);

    logSecurity('ARTICLE_CREATED', "New article: '$clean_title' (slug: $slug)");
    echo json_encode(['data' => ['id' => $db->lastInsertId(), 'slug' => $slug], 'message' => 'Article created']);
}

function updateArticle($id) {
    requireJsonContentType();
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) {
        http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return;
    }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'author', 'editor'])) {
        http_response_code(403); echo json_encode(['error' => 'Forbidden']); return;
    }

    $db = Database::getInstance()->getConnection();
    // Validate article exists & ownership
    $stmt = $db->prepare("SELECT author_id FROM articles WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $article = $stmt->fetch();
    if (!$article) {
        http_response_code(404); echo json_encode(['error' => 'Article not found']); return;
    }
    if ($payload['role'] !== 'admin' && $article['author_id'] != $payload['user_id']) {
        http_response_code(403); echo json_encode(['error' => 'Forbidden: You can only edit your own articles']); return;
    }

    $data = getJsonBody();
    if (!$data || !isset($data['title'])) {
        http_response_code(400); echo json_encode(['error' => 'Title is required']); return;
    }

    $clean_title = strip_tags($data['title']);
    $clean_excerpt = strip_tags($data['excerpt'] ?? '');
    
    $autoloadPath = __DIR__ . '/../vendor/autoload.php';
    if (file_exists($autoloadPath)) {
        require_once $autoloadPath;
        $config = HTMLPurifier_Config::createDefault();
        $purifier = new HTMLPurifier($config);
        $clean_content = $purifier->purify($data['content'] ?? '');
    } else {
        $allowed_tags = '<p><br><strong><em><ul><li><ol><h1><h2><h3><h4><h5><h6><blockquote><a><img>';
        $clean_content = strip_tags($data['content'] ?? '', $allowed_tags);
    }

    $stmt = $db->prepare(
        "UPDATE articles SET title = :title, excerpt = :excerpt, content = :content, 
         image_url = :image, category_id = :cat, status = :status, featured = :featured, 
         read_time = :read_time, updated_at = NOW() WHERE id = :id"
    );
    $stmt->execute([
        ':title' => $clean_title,
        ':excerpt' => $clean_excerpt,
        ':content' => $clean_content,
        ':image' => filter_var($data['image_url'] ?? '', FILTER_SANITIZE_URL),
        ':cat' => $data['category_id'] ?? null,
        ':status' => in_array($data['status'] ?? '', ['draft', 'published', 'archived']) ? $data['status'] : 'draft',
        ':featured' => ($payload['role'] === 'admin') ? ($data['featured'] ?? false) : false,
        ':read_time' => strip_tags($data['read_time'] ?? '5 menit'),
        ':id' => $id
    ]);

    logSecurity('ARTICLE_UPDATED', "Article #$id updated by user {$payload['user_id']}");
    echo json_encode(['message' => 'Article updated successfully']);
}

function deleteArticle($id) {
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) {
        http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return;
    }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'author', 'editor'])) {
        http_response_code(403); echo json_encode(['error' => 'Forbidden']); return;
    }

    $db = Database::getInstance()->getConnection();
    // Validate article exists & ownership
    $stmt = $db->prepare("SELECT author_id FROM articles WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $article = $stmt->fetch();
    if (!$article) {
        http_response_code(404); echo json_encode(['error' => 'Article not found']); return;
    }
    if ($payload['role'] !== 'admin' && $article['author_id'] != $payload['user_id']) {
        http_response_code(403); echo json_encode(['error' => 'Forbidden: You can only delete your own articles']); return;
    }

    $stmt = $db->prepare("DELETE FROM articles WHERE id = :id");
    $stmt->execute([':id' => $id]);

    logSecurity('ARTICLE_DELETED', "Article #$id deleted by user {$payload['user_id']}");
    echo json_encode(['message' => 'Article deleted successfully']);
}

function createComment() {
    requireJsonContentType();
    // Rate limiting: max 5 komentar per menit per IP
    checkRateLimit('createComment', 5, 60);
    
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || empty($data['article_id']) || empty(trim($data['content'] ?? ''))) {
        http_response_code(400);
        echo json_encode(['error' => 'article_id and content are required']);
        return;
    }

    // Validasi panjang input (anti-spam)
    $authorName = trim($data['author_name'] ?? 'Anonymous');
    $content = trim($data['content']);
    
    if (mb_strlen($authorName) > 100) {
        http_response_code(400);
        echo json_encode(['error' => 'Author name too long (max 100 characters)']);
        return;
    }
    
    if (mb_strlen($content) > 5000) {
        http_response_code(400);
        echo json_encode(['error' => 'Comment too long (max 5000 characters)']);
        return;
    }
    
    if (mb_strlen($content) < 2) {
        http_response_code(400);
        echo json_encode(['error' => 'Comment too short (min 2 characters)']);
        return;
    }

    $db = Database::getInstance()->getConnection();
    $author_email = filter_var($data['author_email'] ?? '', FILTER_SANITIZE_EMAIL);
    if ($author_email && !filter_var($author_email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        return;
    }

    $stmt = $db->prepare(
        "INSERT INTO comments (article_id, author_name, author_email, content) VALUES (:aid, :name, :email, :content)"
    );
    $stmt->execute([
        ':aid' => (int) $data['article_id'],
        ':name' => htmlspecialchars($authorName, ENT_QUOTES, 'UTF-8'),
        ':email' => $author_email,
        ':content' => htmlspecialchars($content, ENT_QUOTES, 'UTF-8'),
    ]);

    logSecurity('COMMENT_CREATED', "New comment on article #{$data['article_id']} by '$authorName'");
    echo json_encode(['message' => 'Comment submitted for review']);
}

function subscribe() {
    requireJsonContentType();
    // Rate limiting: max 3 subscribe requests per minute per IP
    checkRateLimit('subscribe', 3, 60);

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email is required']);
        return;
    }

    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        return;
    }

    // Validate email length
    if (mb_strlen($data['email']) > 254) {
        http_response_code(400);
        echo json_encode(['error' => 'Email too long']);
        return;
    }

    // Normalise and sanitise the email address
    $email = strtolower(trim($data['email']));
    $safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');

    // Insert subscriber into database. If the email already exists the
    // ON DUPLICATE KEY UPDATE clause will re-activate the subscriber.
    try {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare(
            "INSERT INTO newsletter_subscribers (email) VALUES (:email)
             ON DUPLICATE KEY UPDATE status = 'active', email = VALUES(email)"
        );
        $stmt->execute([':email' => $email]);
        logSecurity('NEWSLETTER_SUBSCRIBE', "New subscriber: " . $safeEmail);
        echo json_encode(['message' => 'Subscribed successfully', 'email' => $safeEmail]);
    } catch (PDOException $e) {
        error_log("[NEWSLETTER] DB error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to subscribe']);
    }
}

function uploadImage() {
    // Check Auth
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'author', 'editor'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        return;
    }

    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'No image uploaded or upload error']);
        return;
    }

    $file = $_FILES['image'];
    
    // Validate Size (Max 2MB)
    if ($file['size'] > 2 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['error' => 'File too large. Max 2MB']);
        return;
    }

    // Validate Magic Bytes (MIME type)
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!in_array($mimeType, $allowedMimeTypes)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file type. Only JPG, PNG, WEBP allowed']);
        return;
    }

    // Generate secure filename
    $extension = '';
    if ($mimeType === 'image/jpeg') $extension = '.jpg';
    elseif ($mimeType === 'image/png') $extension = '.png';
    elseif ($mimeType === 'image/webp') $extension = '.webp';

    $filename = uniqid('img_', true) . $extension;
    $uploadDir = __DIR__ . '/../uploads/';
    $destination = $uploadDir . $filename;

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    if (move_uploaded_file($file['tmp_name'], $destination)) {
        $backend_url = rtrim(getenv('BACKEND_URL'), '/');
        if (!$backend_url) {
            $scheme = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            $script_path = str_replace('/api/index.php', '', $_SERVER['SCRIPT_NAME']);
            $backend_url = $scheme . '://' . $host . $script_path;
        }
        $url = $backend_url . '/uploads/' . $filename;
        logSecurity('FILE_UPLOAD', "User {$payload['user_id']} uploaded $filename");
        echo json_encode(['url' => $url, 'message' => 'Upload successful']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to move uploaded file']);
    }
}

function getCurrentUser() {
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        return;
    }
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT id, display_name as name, role FROM users WHERE id = :id");
    $stmt->execute([':id' => $payload['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }
    
    echo json_encode(['user' => $user]);
}

function resetPassword() {
    requireJsonContentType();
    checkRateLimit('resetPassword', 5, 300);
    
    $data = getJsonBody();
    if (empty($data['token']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Token and new password required']);
        return;
    }
    
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT email FROM password_resets WHERE token = :token AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)");
    $stmt->execute([':token' => $data['token']]);
    $reset = $stmt->fetch();
    
    if (!$reset) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or expired token']);
        return;
    }
    
    $hash = password_hash($data['password'], PASSWORD_BCRYPT);
    $updateStmt = $db->prepare("UPDATE users SET password_hash = :hash WHERE email = :email");
    $updateStmt->execute([':hash' => $hash, ':email' => $reset['email']]);
    
    $delStmt = $db->prepare("DELETE FROM password_resets WHERE email = :email");
    $delStmt->execute([':email' => $reset['email']]);
    
    logSecurity('PASSWORD_RESET', "Password reset for: " . $reset['email']);
    echo json_encode(['message' => 'Password reset successfully']);
}

function getSitemapXml() {
    header('Content-Type: application/xml; charset=utf-8');
    $db = Database::getInstance()->getConnection();
    global $frontend_url;
    $baseUrl = rtrim($frontend_url, '/');
    
    $stmt = $db->query("SELECT slug, updated_at FROM articles WHERE status = 'published' ORDER BY updated_at DESC");
    $articles = $stmt->fetchAll();
    
    echo '<?xml version="1.0" encoding="UTF-8"?>';
    echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    
    echo "<url><loc>$baseUrl/</loc><priority>1.0</priority></url>";
    
    foreach ($articles as $a) {
        $date = date('Y-m-d', strtotime($a['updated_at']));
        echo "<url><loc>$baseUrl/article/{$a['slug']}</loc><lastmod>$date</lastmod><priority>0.8</priority></url>";
    }
    echo '</urlset>';
}

function getRssXml() {
    header('Content-Type: application/rss+xml; charset=utf-8');
    $db = Database::getInstance()->getConnection();
    global $frontend_url;
    $baseUrl = rtrim($frontend_url, '/');
    
    $stmt = $db->query("SELECT a.*, u.display_name as author_name FROM articles a LEFT JOIN users u ON a.author_id = u.id WHERE a.status = 'published' ORDER BY a.published_at DESC LIMIT 20");
    $articles = $stmt->fetchAll();
    
    echo '<?xml version="1.0" encoding="UTF-8"?>';
    echo '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">';
    echo '<channel>';
    echo '<title>KBB Sadunia News</title>';
    echo "<link>$baseUrl/</link>";
    echo '<description>Berita dan Informasi Kerukunan Bubuhan Banjar Sadunia</description>';
    echo "<atom:link href=\"$baseUrl/api/rss.xml\" rel=\"self\" type=\"application/rss+xml\" />";
    
    foreach ($articles as $a) {
        $date = date(DATE_RSS, strtotime($a['published_at']));
        $title = htmlspecialchars($a['title'], ENT_XML1);
        $excerpt = htmlspecialchars($a['excerpt'] ?: strip_tags(substr($a['content'], 0, 150)), ENT_XML1);
        $link = "$baseUrl/article/{$a['slug']}";
        echo "<item>";
        echo "<title>$title</title>";
        echo "<link>$link</link>";
        echo "<guid>$link</guid>";
        echo "<pubDate>$date</pubDate>";
        echo "<description>$excerpt</description>";
        echo "</item>";
    }
    echo '</channel></rss>';
}

function getComments() {
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return; }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'editor'])) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); return; }
    
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query("SELECT c.*, a.title as article_title FROM comments c LEFT JOIN articles a ON c.article_id = a.id ORDER BY c.created_at DESC");
    echo json_encode(['data' => $stmt->fetchAll()]);
}

function updateCommentStatus($id) {
    requireJsonContentType();
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return; }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'editor'])) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); return; }
    
    $data = getJsonBody();
    if (!isset($data['status']) || !in_array($data['status'], ['approved', 'pending'])) {
        http_response_code(400); echo json_encode(['error' => 'Invalid status']); return;
    }
    
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("UPDATE comments SET status = :status WHERE id = :id");
    $stmt->execute([':status' => $data['status'], ':id' => $id]);
    echo json_encode(['message' => 'Comment status updated']);
}

function deleteComment($id) {
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return; }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'editor'])) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); return; }
    
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("DELETE FROM comments WHERE id = :id");
    $stmt->execute([':id' => $id]);
    echo json_encode(['message' => 'Comment deleted']);
}
