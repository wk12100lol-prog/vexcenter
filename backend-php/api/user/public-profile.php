<?php
$targetUserId = $_GET['id'] ?? null;
if (!$targetUserId) Response::error(400, 'User ID required');

$user = Database::fetch(
    "SELECT id, username, avatar, role, status_message, bio, website, display_name FROM users WHERE id = ?",
    [$targetUserId]
);
if (!$user) Response::error(404, 'User not found');

// Convert file-based avatar to data URL if needed
if ($user['avatar'] && !str_starts_with($user['avatar'], 'data:')) {
    $avatarPath = __DIR__ . '/../../' . $user['avatar'];
    if (file_exists($avatarPath)) {
        $avatarData = file_get_contents($avatarPath);
        $avatarMime = mime_content_type($avatarPath);
        $user['avatar'] = 'data:' . $avatarMime . ';base64,' . base64_encode($avatarData);
    } else {
        $user['avatar'] = null;
    }
}

try {
    $stats = Database::fetch(
        "SELECT
            (SELECT COUNT(*) FROM purchases WHERE user_id = ?) as gameCount,
            (SELECT COUNT(*) FROM reviews WHERE user_id = ?) as reviewCount",
        [$targetUserId, $targetUserId]
    );
} catch (Exception $e) {
    $stats = ['gameCount' => 0, 'reviewCount' => 0];
}

Response::success([
    'user' => array_merge($user, [
        'gameCount' => (int)($stats['gameCount'] ?? 0),
        'reviewCount' => (int)($stats['reviewCount'] ?? 0),
    ]),
]);