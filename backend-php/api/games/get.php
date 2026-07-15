<?php
$currentUser = Auth::getUserFromToken();
$userId = $currentUser ? $currentUser['id'] : 0;

$game = Database::fetch(
    "SELECT g.id, g.user_id, g.title, g.description, g.thumbnail, g.price, g.category, g.tags, g.rating, g.status, g.is_featured, g.game_file, g.download_count, g.created_at, g.updated_at,
            u.username as developer_name, u.avatar as developer_avatar
     FROM games g
     LEFT JOIN users u ON g.user_id = u.id
     WHERE g.id = ? AND (g.status = 'approved' OR g.user_id = ?)",
    [$id, $userId]
);
if (!$game) Response::error(404, 'Game not found');

$game['price'] = (float)$game['price'];
$game['rating'] = $game['rating'] ? (float)$game['rating'] : null;
$game['tags'] = $game['tags'] ? explode(',', $game['tags']) : [];

$downloads = Database::fetchAll("SELECT * FROM game_downloads WHERE game_id = ? ORDER BY created_at DESC", [$id]);
$screenshots = Database::fetchAll("SELECT * FROM game_screenshots WHERE game_id = ? ORDER BY sort_order ASC", [$id]);
$reviews = Database::fetchAll(
    "SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.game_id = ? ORDER BY r.created_at DESC LIMIT 20",
    [$id]
);
$isInstalled = false;
$installation = null;
if ($userId) {
    $installation = Database::fetch("SELECT * FROM game_installations WHERE user_id = ? AND game_id = ?", [$userId, $id]);
    $isInstalled = !!$installation;
}

Response::success([
    'game' => $game,
    'downloads' => $downloads,
    'screenshots' => $screenshots,
    'reviews' => $reviews,
    'is_installed' => $isInstalled,
    'installation' => $installation,
]);
