<?php
/**
 * Structured JSON Logger
 */
class Logger {
    private static $instance = null;
    private $logDir;
    private $logLevel;
    
    const LEVELS = [
        'DEBUG' => 100,
        'INFO' => 200,
        'WARNING' => 300,
        'ERROR' => 400,
        'CRITICAL' => 500,
    ];

    private function __construct() {
        $this->logDir = getenv('LOG_DIR') ?: __DIR__ . '/../../logs';
        $this->logLevel = getenv('LOG_LEVEL') ?: 'INFO';
        
        if (!is_dir($this->logDir)) {
            @mkdir($this->logDir, 0755, true);
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function write($level, $message, $context = [], $filename = 'api.log') {
        if (self::LEVELS[$level] < self::LEVELS[strtoupper($this->logLevel)]) {
            return;
        }

        $logFile = $this->logDir . '/' . $filename;
        
        // Auto-rotate if > 10MB
        if (file_exists($logFile) && filesize($logFile) > 10 * 1024 * 1024) {
            rename($logFile, $logFile . '.' . date('Ymd_His'));
        }

        $entry = json_encode([
            'timestamp' => date('c'),
            'level' => $level,
            'message' => $message,
            'context' => $context,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'ua' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'uri' => $_SERVER['REQUEST_URI'] ?? 'unknown'
        ]) . PHP_EOL;

        @file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);
    }

    public function info($message, $context = []) {
        $this->write('INFO', $message, $context);
    }

    public function warning($message, $context = []) {
        $this->write('WARNING', $message, $context);
    }

    public function error($message, $context = []) {
        $this->write('ERROR', $message, $context, 'error.log');
    }

    public function critical($message, $context = []) {
        $this->write('CRITICAL', $message, $context, 'error.log');
    }

    public function security($type, $message, $context = []) {
        $this->write('WARNING', $message, array_merge(['security_type' => $type], $context), 'security.log');
    }
}
