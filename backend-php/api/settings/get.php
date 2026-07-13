<?php
$settings = Database::fetch("SELECT id, username, email, avatar, role, status_message, display_name, bio, website FROM users WHERE id = ?", [$user['id']]);
$stats = Database::fetch(
    "SELECT (SELECT COUNT(*) FROM purchases WHERE user_id = ?) as gameCount,
            (SELECT COUNT(*) FROM reviews WHERE user_id = ?) as reviewCount,
            (SELECT COUNT(*) FROM friends WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted') as friendCount,
            (SELECT COUNT(*) FROM game_installations WHERE user_id = ?) as installedCount",
    [$user['id'], $user['id'], $user['id'], $user['id'], $user['id']]
);
$devApp = Database::fetch("SELECT * FROM developer_applications WHERE user_id = ?", [$user['id']]);
$installations = Database::fetchAll(
    "SELECT gi.*, g.title as game_title FROM game_installations gi JOIN games g ON gi.game_id = g.id WHERE gi.user_id = ?", [$user['id']]
);
Response::success([
    'user' => $settings,
    'stats' => $stats,
    'developer_application' => $devApp,
    'installations' => $installations,
]);
