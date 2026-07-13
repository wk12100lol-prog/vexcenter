<?php
/**
 * Globalna konfiguracja aplikacji
 */

define('APP_NAME', 'VexCenter');
define('APP_VERSION', '1.0.0');
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_GAME_SIZE', 2 * 1024 * 1024 * 1024);
define('ALLOWED_EXTENSIONS', ['zip', 'rar', '7z', 'exe', 'msi']);
define('DEFAULT_PAGE_SIZE', 24);
