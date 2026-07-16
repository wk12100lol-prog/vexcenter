<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

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
require_once __DIR__ . '/../includes/Response.php';
require_once __DIR__ . '/../includes/Auth.php';
require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/Logger.php';

// Vercel: REQUEST_URI może być inny, próbujemy różnych źródeł
$uri = '';
$reqUri = $_SERVER['REQUEST_URI'] ?? '';
if (!empty($_SERVER['PATH_INFO'])) {
    $uri = $_SERVER['PATH_INFO'];
    $qPos = strpos($uri, '?');
    if ($qPos !== false) $uri = substr($uri, 0, $qPos);
} elseif (!empty($reqUri)) {
    $uri = parse_url($reqUri, PHP_URL_PATH);
} elseif (!empty($_SERVER['ORIG_PATH_INFO'])) {
    $uri = $_SERVER['ORIG_PATH_INFO'];
    $qPos = strpos($uri, '?');
    if ($qPos !== false) $uri = substr($uri, 0, $qPos);
}
$uri = preg_replace('#^/api#', '', $uri);
$uri = trim($uri, '/');
$method = strtolower($_SERVER['REQUEST_METHOD']);

$segments = explode('/', $uri);
$resource = $segments[0] ?? '';
$id = $segments[1] ?? null;
$subresource = $segments[2] ?? null;

try {
    switch ($resource) {
        case 'auth':        require __DIR__ . '/auth/router.php'; break;
        case 'games':       require __DIR__ . '/games/router.php'; break;
        case 'user':        require __DIR__ . '/user/router.php'; break;
        case 'store':       require __DIR__ . '/store/router.php'; break;
        case 'admin':       require __DIR__ . '/admin/router.php'; break;
        case 'friends':     require __DIR__ . '/friends/router.php'; break;
        case 'settings':    require __DIR__ . '/settings/router.php'; break;
        case 'developer':   require __DIR__ . '/developer/router.php'; break;
        case 'notifications': require __DIR__ . '/notifications/router.php'; break;
        case 'announcements': require __DIR__ . '/announcements.php'; break;
        case 'review-comments': require __DIR__ . '/reviews/router.php'; break;
        case 'reports':     require __DIR__ . '/reports.php'; break;
        case 'ping':        require __DIR__ . '/ping.php'; break;
        case 'image':       require __DIR__ . '/image.php'; break;
        default:            Response::error(404, 'Endpoint not found');
    }
} catch (Exception $e) {
    Logger::error($e->getMessage(), ['uri' => $uri, 'file' => $e->getFile(), 'line' => $e->getLine()]);
    Response::error(500, 'Internal server error');
}
