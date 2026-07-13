<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../includes/Logger.php';
require_once __DIR__ . '/../includes/Database.php';

$info = [
    'status' => 'ok',
    'app' => APP_NAME,
    'version' => APP_VERSION,
    'php_version' => phpversion(),
    'server_time' => date('Y-m-d H:i:s'),
    'pdo_drivers' => PDO::getAvailableDrivers(),
    'mysqlnd' => extension_loaded('mysqlnd'),
    'openssl' => extension_loaded('openssl'),
    'ca_exists' => file_exists(__DIR__ . '/../includes/cacert.pem'),
    'ca_size' => file_exists(__DIR__ . '/../includes/cacert.pem') ? filesize(__DIR__ . '/../includes/cacert.pem') : 0,
    'endpoints' => [
        'auth' => ['login', 'register'],
        'games' => ['list', 'search'],
        'ping' => 'this',
    ],
];

try {
    $db = Database::getInstance();
    $db->query('SELECT 1');
    $info['database'] = 'connected';
} catch (Exception $e) {
    $info['database'] = 'error: ' . $e->getMessage();
}

echo json_encode($info, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
