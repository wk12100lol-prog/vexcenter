<?php
class Logger {
    private static $logDir;

    private static function getDir() {
        if (!self::$logDir) {
            // Vercel: only /tmp is writable
            self::$logDir = getenv('VERCEL') ? '/tmp/logs' : (__DIR__ . '/../logs');
        }
        if (!is_dir(self::$logDir)) mkdir(self::$logDir, 0777, true);
        return self::$logDir;
    }

    public static function error($message, $context = []) {
        $line = date('Y-m-d H:i:s') . ' ERROR: ' . $message;
        if ($context) $line .= ' | ' . json_encode($context, JSON_UNESCAPED_UNICODE);
        $line .= PHP_EOL;
        @file_put_contents(self::getDir() . '/error.log', $line, FILE_APPEND | LOCK_EX);
    }

    public static function info($message, $context = []) {
        $line = date('Y-m-d H:i:s') . ' INFO: ' . $message;
        if ($context) $line .= ' | ' . json_encode($context, JSON_UNESCAPED_UNICODE);
        $line .= PHP_EOL;
        @file_put_contents(self::getDir() . '/app.log', $line, FILE_APPEND | LOCK_EX);
    }
}
