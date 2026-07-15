<?php
if ($method === 'post') {
    $currentUser = Auth::getUserFromToken();
    $userId = $currentUser ? $currentUser['id'] : 0;
    if (!$userId) Response::error(401, 'Authentication required');

    try {
        Database::execute("ALTER TABLE games MODIFY COLUMN play_count INT UNSIGNED NOT NULL DEFAULT 0");
    } catch (Exception $e) {}

    Database::execute("UPDATE games SET play_count = play_count + 1 WHERE id = ?", [$id]);
    Response::success(null, 'Play recorded');
} else {
    Response::error(405, 'Method not allowed');
}
